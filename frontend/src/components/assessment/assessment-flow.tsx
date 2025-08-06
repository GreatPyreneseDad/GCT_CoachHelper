'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { clientService, AssessmentQuestion } from '@/services/api/client.service';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';

interface AssessmentFlowProps {
  type?: 'initial' | 'quick_checkin' | 'deep_dive';
  onComplete?: (scores: any) => void;
}

export function AssessmentFlow({ type = 'quick_checkin', onComplete }: AssessmentFlowProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<{
    id: string;
    questions: AssessmentQuestion[];
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startAssessment = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.startAssessment(type);
      setAssessment({
        id: data.assessmentId,
        questions: data.questions,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = (value: any) => {
    if (!assessment) return;
    
    const question = assessment.questions[currentQuestionIndex];
    setResponses(prev => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < assessment!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    if (!assessment) return;

    setIsSubmitting(true);
    try {
      const responseArray = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const result = await clientService.submitAssessment(assessment.id, responseArray);
      
      toast({
        title: 'Assessment Complete!',
        description: `Your coherence score: ${result.coherenceScore}%`,
      });

      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assessment) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {type === 'initial' && 'Initial Assessment'}
            {type === 'quick_checkin' && 'Quick Check-in'}
            {type === 'deep_dive' && 'Deep Dive Assessment'}
          </CardTitle>
          <CardDescription>
            {type === 'initial' && 'This comprehensive assessment will establish your baseline coherence.'}
            {type === 'quick_checkin' && 'A quick 5-minute check on your current coherence.'}
            {type === 'deep_dive' && 'An in-depth exploration of your coherence patterns.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={startAssessment} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Start Assessment'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const currentResponse = responses[currentQuestion.id];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-6">{currentQuestion.text}</h3>
            
            {currentQuestion.type === 'scale' && (
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <Slider
                  value={[currentResponse || 5]}
                  onValueChange={(value) => handleResponse(value[0])}
                  min={currentQuestion.minValue || 1}
                  max={currentQuestion.maxValue || 10}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-2xl font-bold">
                  {currentResponse || 5}
                </div>
              </div>
            )}
            
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <RadioGroup
                value={currentResponse}
                onValueChange={handleResponse}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="cursor-pointer flex-1 p-3 rounded-lg hover:bg-muted"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      
      <CardContent>
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentQuestionIndex < assessment.questions.length - 1 ? (
            <Button
              onClick={goToNext}
              disabled={!currentResponse}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitAssessment}
              disabled={!currentResponse || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Complete
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}