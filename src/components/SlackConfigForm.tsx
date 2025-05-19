
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getIntegrationSettings, saveIntegrationSettings } from "@/services/integrationService";
import { Computer, Brain, Clock3 } from "lucide-react";

// Available emoji options
const emojiOptions = [
  { value: ":person_in_lotus_position:", label: "Meditation", icon: null },
  { value: ":computer:", label: "Computer", icon: <Computer className="h-5 w-5" /> },
  { value: ":brain:", label: "Brain", icon: <Brain className="h-5 w-5" /> },
  { value: ":no_mobile_phones:", label: "No Phones", icon: null },
  { value: ":clock3:", label: "Clock", icon: <Clock3 className="h-5 w-5" /> },
];

interface SlackConfigFormProps {
  isConnected: boolean;
  isAuthenticated: boolean;
}

const SlackConfigForm: React.FC<SlackConfigFormProps> = ({ isConnected, isAuthenticated }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>(":person_in_lotus_position:");
  const [statusText, setStatusText] = useState<string>("Focus time");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  // Only load settings if user is both authenticated and connected to Slack
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      loadSettings();
    }
  }, [isConnected, isAuthenticated]);

  const loadSettings = async () => {
    try {
      const settings = await getIntegrationSettings();
      if (settings.slack_dnd_emoji) {
        setSelectedEmoji(settings.slack_dnd_emoji);
      }
      if (settings.slack_dnd_text) {
        setStatusText(settings.slack_dnd_text);
      }
    } catch (error) {
      console.error("Error loading slack settings:", error);
    }
  };

  const handleSave = async () => {
    if (!isConnected || !isAuthenticated) return;

    setIsSaving(true);
    try {
      const success = await saveIntegrationSettings({
        slack_dnd_emoji: selectedEmoji,
        slack_dnd_text: statusText,
      });

      if (success) {
        toast({
          title: "Success",
          description: "Slack settings saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save Slack settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving slack settings:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if form fields should be disabled
  const isFormDisabled = !isAuthenticated;

  return (
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
                className="flex items-center space-x-2 cursor-pointer"
              >
                {emoji.icon ? (
                  emoji.icon
                ) : (
                  <div className="h-5 w-5 flex items-center justify-center">
                    {emoji.value.replace(/:/g, '')}
                  </div>
                )}
                <span>{emoji.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        onClick={handleSave}
        disabled={isFormDisabled || isSaving}
        className="mt-4"
      >
        {isSaving ? "Saving..." : "Save Slack Settings"}
      </Button>
    </div>
  );
};

export default SlackConfigForm;
