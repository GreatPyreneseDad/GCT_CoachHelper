'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera,
  Plus,
  X,
  Save,
  Loader2,
  Award,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { CoachProfile } from '@/types';

// Mock data
const initialProfile: CoachProfile = {
  bio: 'Certified life coach specializing in personal transformation and goal achievement. I help individuals unlock their potential and create lasting positive change.',
  specialties: ['Life Coaching', 'Goal Setting', 'Mindfulness', 'Career Transition'],
  certifications: ['ICF Certified Coach', 'NLP Practitioner', 'Mindfulness Teacher'],
  experience: '8 years',
  photo: '',
  availability: {
    timezone: 'America/New_York',
    schedule: {
      monday: [{ start: '09:00', end: '17:00', available: true }],
      tuesday: [{ start: '09:00', end: '17:00', available: true }],
      wednesday: [{ start: '09:00', end: '17:00', available: true }],
      thursday: [{ start: '09:00', end: '17:00', available: true }],
      friday: [{ start: '09:00', end: '15:00', available: true }],
      saturday: [],
      sunday: [],
    }
  }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<CoachProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile changes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty && !profile.specialties.includes(newSpecialty)) {
      setProfile({
        ...profile,
        specialties: [...profile.specialties, newSpecialty]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter(s => s !== specialty)
    });
  };

  const addCertification = () => {
    if (newCertification && !profile.certifications.includes(newCertification)) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCertification]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter(c => c !== certification)
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coach Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Your photo helps clients connect with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.photo} />
              <AvatarFallback>
                <Camera className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Photo
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: Professional headshot, 400x400px minimum
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Bio</CardTitle>
          <CardDescription>
            Tell clients about your coaching approach and philosophy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            placeholder="Share your coaching philosophy, approach, and what makes you unique..."
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {profile.bio?.length || 0}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>Coaching Specialties</CardTitle>
          <CardDescription>
            Areas where you have particular expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="gap-1">
                {specialty}
                <button
                  onClick={() => removeSpecialty(specialty)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Add a specialty..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            />
            <Button onClick={addSpecialty} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications & Credentials</CardTitle>
          <CardDescription>
            Professional certifications that build client trust
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {profile.certifications.map((cert) => (
              <div key={cert} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>{cert}</span>
                </div>
                <button
                  onClick={() => removeCertification(cert)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="Add a certification..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            />
            <Button onClick={addCertification} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>
              Years of coaching experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              placeholder="e.g., 5 years"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
            <CardDescription>
              Your primary timezone for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                value={profile.availability.timezone}
                onChange={(e) => setProfile({
                  ...profile,
                  availability: { ...profile.availability, timezone: e.target.value }
                })}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <CardDescription>
            Set your regular coaching hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(profile.availability.schedule).map(([day, slots]) => (
              <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize font-medium w-24">{day}</span>
                </div>
                <div className="flex items-center gap-2">
                  {slots.length > 0 ? (
                    slots.map((slot, idx) => (
                      <Badge key={idx} variant="outline">
                        {slot.start} - {slot.end}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">Unavailable</span>
                  )}
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Public Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile Preview</CardTitle>
          <CardDescription>
            This is how clients will see your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.photo} />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Transform Coach</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {profile.certifications.length} Certifications
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {profile.experience} Experience
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.availability.timezone}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm">{profile.bio}</p>
            <div>
              <h4 className="font-semibold text-sm mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {profile.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}