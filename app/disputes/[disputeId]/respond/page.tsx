'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Dispute {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  type: string;
  reason: string;
  description: string;
  status: string;
  requestedResolution: string;
  requestedAmount?: number;
  evidence: string[];
}

export default function DisputeResponsePage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.disputeId as string;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dispute');
      }
      const data = await response.json();
      setDispute(data.data);
    } catch (error) {
      console.error('Error fetching dispute:', error);
      toast.error('Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const uploadedImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        uploadedImages.push(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }

    setEvidence(prev => [...prev, ...uploadedImages]);
  };

  const removeImage = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error('Please provide a response');
      return;
    }

    setSubmitting(true);

    try {
      const responseData = await fetch(`/api/disputes/${disputeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: response.trim(),
          evidence,
        }),
      });

      if (!responseData.ok) {
        const error = await responseData.json();
        throw new Error(error.error || 'Failed to submit response');
      }

      toast.success('Response submitted successfully!');
      router.push(`/disputes/${disputeId}`);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dispute Not Found</h1>
          <p className="text-gray-600 mb-4">The dispute you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/disputes')}>Back to Disputes</Button>
        </div>
      </div>
    );
  }

  if (dispute.status !== 'awaiting_response') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Respond</h1>
          <p className="text-gray-600 mb-4">This dispute is not currently awaiting a response.</p>
          <Button onClick={() => router.push(`/disputes/${disputeId}`)}>View Dispute</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/disputes/${disputeId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dispute
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Respond to Dispute</h1>
          <p className="text-gray-600">Provide your response to the dispute filed against Order #{dispute.order.orderNumber}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dispute Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Order Number</Label>
              <p className="text-gray-900">{dispute.order.orderNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Dispute Type</Label>
              <p className="text-gray-900 capitalize">{dispute.type.replace('_', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Reason</Label>
              <p className="text-gray-900">{dispute.reason}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-gray-900 whitespace-pre-wrap">{dispute.description}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested Resolution</Label>
              <p className="text-gray-900">{dispute.requestedResolution}</p>
            </div>
            {dispute.requestedAmount && (
              <div>
                <Label className="text-sm font-medium">Requested Amount</Label>
                <p className="text-gray-900">Le {dispute.requestedAmount.toLocaleString()}</p>
              </div>
            )}
            {dispute.evidence.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Evidence Provided</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {dispute.evidence.map((image, index) => (
                    <div key={index}>
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="response">Response *</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Provide a detailed response to the dispute..."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Upload Supporting Evidence (Optional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Evidence
                </label>
              </div>
              
              {evidence.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {evidence.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Response Guidelines</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be professional and respectful in your response</li>
                <li>• Address the specific issues raised in the dispute</li>
                <li>• Provide any relevant evidence or documentation</li>
                <li>• Suggest a fair resolution if possible</li>
                <li>• Your response will be reviewed by our team</li>
              </ul>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/disputes/${disputeId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !response.trim()}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 