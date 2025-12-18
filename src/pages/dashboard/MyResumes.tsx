import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Edit, FileText, MoreHorizontal, Plus, Trash2, CircleDashed, AlertTriangle, UploadCloud, Bot } from "lucide-react";
import { toast } from "sonner";
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface UploadedResumeSummary {
  id: string;
  originalFilename: string;
  uploadTimestamp: string; // ISO string from MongoDB
  overallScore?: number;
  analysisTimestamp?: string; // ISO string
}

interface GeneratedResumeSummary {
  id: string;
  createdAt: string; // ISO string from MongoDB
  inputName?: string;
  inputTargetRole?: string;
  version?: number;
}

// --- Skeleton Card Component ---
const ResumeSkeletonCard = () => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-gray-50 pb-4">
      <Skeleton className="h-5 w-3/4 mb-1" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </CardContent>
    <CardFooter className="flex justify-end border-t p-3">
      <Skeleton className="h-8 w-24" />
    </CardFooter>
  </Card>
);

export default function MyResumes() {
  const navigate = useNavigate();
  const [uploadedResumes, setUploadedResumes] = useState<UploadedResumeSummary[]>([]);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [uploadedRes, generatedRes] = await Promise.all([
          apiClient.get('/resumes'),
          apiClient.get('/builder/generated')
        ]);

        if (uploadedRes.data && Array.isArray(uploadedRes.data.resumes)) {
          setUploadedResumes(uploadedRes.data.resumes);
        } else {
          console.warn('Unexpected format for uploaded resumes:', uploadedRes.data);
          setUploadedResumes([]);
        }

        if (generatedRes.data && Array.isArray(generatedRes.data.generatedResumes)) {
          setGeneratedResumes(generatedRes.data.generatedResumes);
        } else {
          console.warn('Unexpected format for generated resumes:', generatedRes.data);
          setGeneratedResumes([]);
        }

      } catch (err: any) {
        console.error("Error fetching resumes:", err);
        const message = err.response?.data?.message || err.message || "Failed to load your resumes.";
        setError(message);
        toast.error(`Error loading resumes: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string, type: 'uploaded' | 'generated') => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;

    try {
      if (type === 'uploaded') {
        await apiClient.delete(`/resumes/${id}`);
        setUploadedResumes(prev => prev.filter(r => r.id !== id));
        toast.success("Resume deleted successfully");
      } else {
        await apiClient.delete(`/builder/generated/${id}`);
        setGeneratedResumes(prev => prev.filter(r => r.id !== id));
        toast.success("Generated resume deleted successfully");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete resume");
    }
  };

  const handleEdit = (id: string, type: 'uploaded' | 'generated') => {
    // Logic for editing generated resumes (could involve loading builder with input data)
    // For now, keep as placeholder or navigate to builder with ID if supported
    toast.info(`Editing ${type} resume feature coming soon!`);
  };

  const handleDownload = (id: string, type: 'uploaded' | 'generated') => {
    if (type === 'generated' && apiClient.defaults.baseURL) {
      const downloadUrl = `${apiClient.defaults.baseURL}/builder/download/${id}`;
      // Use window.open for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `resume_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading PDF...`);
    } else {
      toast.info(`Original file download is not available. (Files are processed for analysis but not stored permanently).`);
    }
  };

  const handleClone = (id: string, type: 'uploaded' | 'generated') => {
    toast.info(`Clone feature coming soon!`);
  };

  const handleViewAnalysis = (id: string) => {
    navigate(`/analyze/${id}`);
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    if (!timestamp) {
      return 'Date unavailable';
    }
    try {
      const date = new Date(timestamp);
      // Check for invalid date
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'PPP p');
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Resumes</h2>
            <p className="text-muted-foreground">Manage your uploaded and generated resumes</p>
          </div>
          <Button asChild disabled>
            <a href="/builder">
              <Plus className="mr-2 h-4 w-4" />
              Create New Resume
            </a>
          </Button>
        </div>

        <section>
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <UploadCloud className="mr-3 h-6 w-6 text-theme-blue" /> Uploaded Resumes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <ResumeSkeletonCard key={`uploaded-skel-${i}`} />)}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <Bot className="mr-3 h-6 w-6 text-theme-purple" /> AI Generated Resumes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <ResumeSkeletonCard key={`generated-skel-${i}`} />)}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-medium">Failed to load resumes</p>
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Resumes</h2>
          <p className="text-muted-foreground">Manage your uploaded and generated resumes</p>
        </div>
        <Button asChild>
          <a href="/builder">
            <Plus className="mr-2 h-4 w-4" />
            Create New Resume
          </a>
        </Button>
      </div>

      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <UploadCloud className="mr-3 h-6 w-6 text-theme-blue" /> Uploaded Resumes
        </h3>
        {uploadedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedResumes.map((resume) => (
              <Card key={resume.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg break-all">
                      {resume.originalFilename || `Resume ${resume.id.substring(0, 6)}`}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(resume.id, 'uploaded')}>
                          <Download className="mr-2 h-4 w-4" /> Download Original
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(resume.id, 'uploaded')}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">
                      Uploaded: {formatTimestamp(resume.uploadTimestamp)}
                    </span>
                    {resume.overallScore !== undefined && (
                      <div className="flex items-center gap-1" title={`Analyzed: ${formatTimestamp(resume.analysisTimestamp)}`}>
                        <span className="font-semibold text-theme-blue text-sm">{resume.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!resume.overallScore}
                    title={!resume.overallScore ? "Resume not yet analyzed" : "View Analysis"}
                    onClick={() => handleViewAnalysis(resume.id)}
                  >
                    View Analysis
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No resumes uploaded yet.</p>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Bot className="mr-3 h-6 w-6 text-theme-purple" /> AI Generated Resumes
        </h3>
        {generatedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedResumes.map((resume) => (
              <Card key={resume.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {resume.inputName ? `${resume.inputName}'s Resume` : 'Generated Resume'}
                      {resume.inputTargetRole ? ` (${resume.inputTargetRole})` : ''}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(resume.id, 'generated')}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(resume.id, 'generated')}>
                          <Plus className="mr-2 h-4 w-4" /> Clone Input
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(resume.id, 'generated')}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    Generated: {formatTimestamp(resume.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Version: {resume.version}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(resume.id, 'generated')}>
                    <Edit className="mr-2 h-4 w-4" /> View/Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No resumes generated yet.</p>
        )}
      </section>
    </div>
  );
}
