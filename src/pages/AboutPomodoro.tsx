import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Coffee, Brain, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AboutPomodoro: React.FC = () => {
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timer
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">What is the Pomodoro Technique?</h1>
          <p className="text-xl text-muted-foreground">Stay focused, one tomato at a time.</p>
        </div>

        {/* What is the Pomodoro Technique */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary" />
              What is the Pomodoro Technique?
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The Pomodoro Technique is a time management method that breaks work into focused 25-minute intervals, 
                followed by 5-minute breaks. After completing four "pomodoros," you take a longer 15-30 minute break.
              </p>
              <p>
                Created by Francesco Cirillo in the late 1980s, this technique was named after the tomato-shaped 
                kitchen timer he used as a university student ("pomodoro" means tomato in Italian).
              </p>
              <p>
                <strong>Key Benefits:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Improved focus and concentration</li>
                <li>Better time awareness and estimation</li>
                <li>Reduced mental fatigue</li>
                <li>Enhanced productivity and task completion</li>
                <li>Regular breaks to prevent burnout</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro Cycle Visual */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">The Pomodoro Cycle</h3>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm font-medium">25 min</span>
                <span className="text-xs text-muted-foreground">Focus</span>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                  <Coffee className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="text-sm font-medium">5 min</span>
                <span className="text-xs text-muted-foreground">Break</span>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-blue-500">4×</span>
                </div>
                <span className="text-sm font-medium">Repeat</span>
                <span className="text-xs text-muted-foreground">Cycles</span>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <span className="text-sm font-medium">15-30 min</span>
                <span className="text-xs text-muted-foreground">Long Break</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Focus Dive Uses It */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Why Focus Dive Uses the Pomodoro Technique</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Focus Dive applies the Pomodoro Technique with modern workplace integration to maximize your productivity. 
                Our app doesn't just track your time — it actively helps eliminate distractions.
              </p>
              <p>
                <strong>Smart Slack Integration:</strong> When you start a focus session, Focus Dive automatically 
                sets your Slack status to "Do Not Disturb," letting your team know you're in deep work mode. 
                This prevents interruptions and helps maintain your flow state throughout the entire 25-minute session.
              </p>
              <p>
                By combining the proven Pomodoro method with intelligent workspace management, Focus Dive creates 
                an environment where sustained concentration becomes effortless.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Experience */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Personal Experience</h2>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-muted-foreground italic">
                "I love the Pomodoro Technique, but it wasn't very effective for me when distractions kept coming in. 
                Focus Dive helps by stopping Slack messages and letting people know I'm in focus mode. It's also great 
                for learning — having regular breaks really helps me absorb things better. Right now, I use it both for 
                work and study. It gives me space to concentrate and even moments for quick meditation to keep my mind clear. 
                It's been amazing for me, and I hope it can help others too."
              </p>
              <p className="text-sm text-muted-foreground mt-4">— rafaelhdr, Creator of Focus Dive</p>
            </div>
          </CardContent>
        </Card>

        {/* Learn More */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Learn More</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Want to dive deeper into the Pomodoro Technique? Here are some great resources:
              </p>
              <div className="space-y-2">
                <a 
                  href="https://en.wikipedia.org/wiki/Pomodoro_Technique" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Pomodoro Technique on Wikipedia
                </a>
                <a 
                  href="https://francescocirillo.com/pages/pomodoro-technique" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Pomodoro Technique Website
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="px-8">
              Start Your First Pomodoro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPomodoro;