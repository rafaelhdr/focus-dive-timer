import React, { useState, useEffect } from "react";
import { Button } from "@focusdive/ui";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSlackTest } from "@/hooks/useSlack";
import { getIntegrationPreferences, saveIntegrationPreferences } from "@/services/integrationService";
import { Card, CardContent } from "@/components/ui/card";

const emojiOptions = [
  { value: ":person_in_lotus_position:", label: "Meditation", icon: "🧘" },
  { value: ":computer:", label: "Computer", icon: "💻" },
  { value: ":brain:", label: "Brain", icon: "🧠" },
  { value: ":no_mobile_phones:", label: "No Phones", icon: "📵" },
  { value: ":clock3:", label: "Clock", icon: "🕒" },
];

interface SlackConfigFormProps {
  isConnected: boolean;
  isAuthenticated: boolean;
}

const SlackConfigForm: React.FC<SlackConfigFormProps> = ({ isConnected, isAuthenticated }) => {
  const [slackEnabled, setSlackEnabled] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(":person_in_lotus_position:");
  const [statusText, setStatusText] = useState<string>("Focus time");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();
  const slackTestMutation = useSlackTest();

  // Only load preferences if user is both authenticated and connected to Slack
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      loadPreferences();
    }
  }, [isConnected, isAuthenticated]);

  const loadPreferences = async () => {
    try {
      const preferences = await getIntegrationPreferences();
      if (preferences.slack_enabled !== undefined) {
        setSlackEnabled(preferences.slack_enabled);
      }
      if (preferences.slack_dnd_emoji) {
        setSelectedEmoji(preferences.slack_dnd_emoji);
      }
      if (preferences.slack_dnd_text) {
        setStatusText(preferences.slack_dnd_text);
      }
    } catch (error) {
      console.error("Error loading slack preferences:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default button behavior
    
    if (!isConnected || !isAuthenticated) return;

    setIsSaving(true);
    try {
      console.log("Saving preferences:", { emoji: selectedEmoji, text: statusText });
      
      const success = await saveIntegrationPreferences({
        slack_enabled: slackEnabled,
        slack_dnd_emoji: selectedEmoji,
        slack_dnd_text: statusText,
      });

      console.log("Save result:", success);

      if (success) {
        toast({
          title: "Success",
          description: "Slack preferences saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save Slack preferences.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving slack preferences:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestStart = async () => {
    if (!isConnected || !isAuthenticated) return;

    const response = await slackTestMutation.mutateAsync({
      body: {
        action: 'start',
        dnd_text: statusText,
        dnd_emoji: selectedEmoji,
      }
    });

    if (response.success) {
      toast({
        title: "Test Started",
        description: "Slack status has been set with your test preferences.",
      });
    } else {
      toast({
        title: "Test Failed",
        description: response.message || "Failed to start Slack test.",
        variant: "destructive",
      });
    }
  };

  const handleTestStop = async () => {
    if (!isConnected || !isAuthenticated) return;

    const response = await slackTestMutation.mutateAsync({
      body: {
        action: 'stop',
        dnd_text: statusText,
        dnd_emoji: selectedEmoji,
      }
    });

    if (response.success) {
      toast({
        title: "Test Stopped",
        description: "Slack status has been cleared.",
      });
    } else {
      toast({
        title: "Test Failed",
        description: response.message || "Failed to start Slack test.",
        variant: "destructive",
      });
    }
  };

  // Get the icon for the currently selected emoji
  const getSelectedEmojiIcon = (): string => {
    const found = emojiOptions.find(emoji => emoji.value === selectedEmoji);
    return found ? found.icon : "🧘";
  };

  // Determine if form fields should be disabled
  const isFormDisabled = !isAuthenticated || !slackEnabled;

  // Only show configuration sections if connected to Slack
  if (!isConnected) {
    return (
      <div className="space-y-6">
        {/* Enable/Disable Slack Integration */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="slack-enable" className="text-base">
              Enable Slack Integration
            </Label>
            <div className="text-sm text-muted-foreground">
              Allow Focus Dive to control your Slack status during sessions
            </div>
          </div>
          <Switch
            id="slack-enable"
            checked={false}
            onCheckedChange={() => {}}
            disabled={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Slack Integration */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="slack-enable" className="text-base">
            Enable Slack Integration
          </Label>
          <div className="text-sm text-muted-foreground">
            Allow Focus Dive to control your Slack status during sessions
          </div>
        </div>
        <Switch
          id="slack-enable"
          checked={slackEnabled}
          onCheckedChange={setSlackEnabled}
          disabled={!isAuthenticated || !isConnected}
        />
      </div>

      <Separator />

      <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Status Text</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Text that will show in your Slack status during focus time.
        </p>
        <Input
          placeholder="Focus time"
          value={statusText}
          onChange={(e) => setStatusText(e.target.value)}
          className="max-w-md"
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Status Emoji</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Select an emoji to display with your status.
        </p>
        <RadioGroup
          value={selectedEmoji}
          onValueChange={setSelectedEmoji}
          className="flex flex-col space-y-2"
        >
          {emojiOptions.map((emoji) => (
            <div key={emoji.value} className="flex items-center space-x-2">
              <RadioGroupItem value={emoji.value} id={emoji.value} disabled={isFormDisabled} />
              <Label
                htmlFor={emoji.value}
                className="flex items-center space-x-6 cursor-pointer"
              >
                {emoji.icon ? (
                  emoji.icon
                ) : (
                  <div className="h-5 w-5 flex items-center justify-center">
                    {emoji.value.replace(/:/g, '')}
                  </div>
                )}
                <span className="pl-2">{emoji.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Preview section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Preview</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Here's how your status will appear in Slack during focus time:
        </p>
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 mb-4">
              <div className="flex items-center justify-center w-8 h-8">
                {getSelectedEmojiIcon()}
              </div>
              <span className="font-medium text-sm">{statusText || "Focus time"}</span>
            </div>
            
            {/* Test buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleTestStart}
                disabled={isFormDisabled || slackTestMutation.isPending || !isConnected}
                size="sm"
                variant="outline"
                type="button"
              >
                {slackTestMutation.isPending ? "Testing..." : "Test Start"}
              </Button>
              <Button
                onClick={handleTestStop}
                disabled={isFormDisabled || slackTestMutation.isPending || !isConnected}
                size="sm"
                variant="outline"
                type="button"
              >
                {slackTestMutation.isPending ? "Stopping..." : "Test Stop"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleSave}
        disabled={!isAuthenticated || !isConnected || isSaving}
        className="mt-4"
        type="button"
      >
        {isSaving ? "Saving..." : "Save Slack Preferences"}
      </Button>
      </div>
    </div>
  );
};

export default SlackConfigForm;
