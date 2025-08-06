import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Copy, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dashboardService } from '@/services/api/dashboard.service';

export function InviteClientDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.createClientInvite(email, name);
      setInviteCode(response.inviteCode);
      setInviteUrl(response.inviteUrl);
      
      toast({
        title: 'Invite created!',
        description: email ? 'Invitation email sent successfully.' : 'Share the code with your client.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create invite. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Invite link copied to clipboard.',
    });
  };

  const resetDialog = () => {
    setInviteCode('');
    setInviteUrl('');
    setEmail('');
    setName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New Client</DialogTitle>
        </DialogHeader>
        
        {!inviteCode ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If provided, we'll send an invitation email
              </p>
            </div>
            
            <Button 
              onClick={handleInvite} 
              disabled={!name || isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Invite'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium">Invite Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-background px-3 py-2 rounded font-mono">
                    {inviteCode}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(inviteCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Invite Link</p>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={inviteUrl} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(inviteUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {email && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invitation sent to {email}
              </p>
            )}
            
            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}