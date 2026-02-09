// File: Frontend/src/pages/leads/LeadForm.tsx
// NEW FILE: Create this file to enable adding new leads

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { leadsApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { LeadSource, LeadType } from '@types/index';

export default function LeadForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    source: LeadSource.MANUAL,
    leadType: LeadType.INBOUND,
    sender: {
      platformUserId: '',
      displayName: '',
      email: '',
      phone: '',
    },
    content: {
      body: '',
      subject: '',
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: any) => leadsApi.createLead(data),
    onSuccess: () => {
      toast.success('Lead created successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigate('/leads');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create lead');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.sender.displayName && !formData.sender.email && !formData.sender.phone) {
      toast.error('Please provide at least one contact detail (name, email, or phone)');
      return;
    }
    
    if (!formData.content.body) {
      toast.error('Please provide a message or description');
      return;
    }

    // Generate a platform user ID if not provided
    const leadData = {
      ...formData,
      sender: {
        ...formData.sender,
        platformUserId: formData.sender.platformUserId || 
          `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };

    createLeadMutation.mutate(leadData);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('sender.')) {
      const senderField = field.split('.')[1];
      setFormData({
        ...formData,
        sender: {
          ...formData.sender,
          [senderField]: value,
        },
      });
    } else if (field.startsWith('content.')) {
      const contentField = field.split('.')[1];
      setFormData({
        ...formData,
        content: {
          ...formData.content,
          [contentField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/leads')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
        <p className="text-muted-foreground mt-1">
          Manually add a new lead to your pipeline
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleInputChange('source', value)}
                  >
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LeadSource).map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.replace(/_/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type *</Label>
                  <Select
                    value={formData.leadType}
                    onValueChange={(value) => handleInputChange('leadType', value)}
                  >
                    <SelectTrigger id="leadType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LeadType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  value={formData.sender.displayName}
                  onChange={(e) => handleInputChange('sender.displayName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.sender.email}
                    onChange={(e) => handleInputChange('sender.email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.sender.phone}
                    onChange={(e) => handleInputChange('sender.phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message/Description */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  value={formData.content.subject}
                  onChange={(e) => handleInputChange('content.subject', e.target.value)}
                  placeholder="Inquiry about services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message/Description *</Label>
                <Textarea
                  id="body"
                  value={formData.content.body}
                  onChange={(e) => handleInputChange('content.body', e.target.value)}
                  placeholder="Enter the lead's message or description..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/leads')}
              disabled={createLeadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLeadMutation.isPending}
            >
              {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}