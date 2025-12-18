import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Award, Calendar } from 'lucide-react';

interface ResumeData {
    personalInfo: {
        name: string;
        email: string;
        phone?: string;
        linkedin?: string;
        portfolio?: string;
        address?: string;
    };
    summary?: string;
    education: {
        institution: string;
        degree: string;
        fieldOfStudy?: string;
        startDate?: string;
        endDate?: string;
        details?: string[];
    }[];
    experience: {
        jobTitle: string;
        company: string;
        location?: string;
        startDate: string;
        endDate: string;
        responsibilities: string[];
    }[];
    skills: {
        category?: string;
        items: string[];
    }[];
    certifications?: {
        name: string;
        issuingOrganization?: string;
        dateObtained?: string;
    }[];
    projects?: {
        name: string;
        description: string;
        technologies?: string[];
        link?: string;
    }[];
    targetJobRole?: string;
}

interface CreativeProfessionalTemplateProps {
    data: ResumeData;
}

const CreativeProfessionalTemplate: React.FC<CreativeProfessionalTemplateProps> = ({ data }) => {
    const { personalInfo, summary, experience, education, skills, certifications, projects } = data;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans shadow-2xl mx-auto flex overflow-hidden">
            {/* Sidebar (Left Column) */}
            <div className="w-[30%] bg-slate-900 text-white flex flex-col p-6 print:bg-slate-900 print:text-white">
                {/* Contact Info */}
                <div className="mb-8">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 border-b border-slate-700 pb-2">Contact</h3>
                    <div className="space-y-3 text-sm">
                        {personalInfo.email && (
                            <div className="flex items-start gap-2 break-all">
                                <Mail className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                                <span>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div className="flex items-start gap-2 break-all">
                                <Linkedin className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                                <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                        {personalInfo.portfolio && (
                            <div className="flex items-start gap-2 break-all">
                                <Globe className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                                <span>{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Education */}
                <div className="mb-8">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 border-b border-slate-700 pb-2">Education</h3>
                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-bold text-blue-300">{edu.degree}</div>
                                <div className="text-slate-300">{edu.fieldOfStudy}</div>
                                <div className="text-slate-400 text-xs mt-1">{edu.institution}</div>
                                <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    {edu.startDate} - {edu.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-8">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 border-b border-slate-700 pb-2">Expertise</h3>
                    <div className="space-y-4">
                        {skills.map((skillGroup, index) => (
                            <div key={index}>
                                <div className="text-xs font-semibold text-blue-300 mb-1">{skillGroup.category}</div>
                                <div className="flex flex-wrap gap-2">
                                    {skillGroup.items.map((skill, idx) => (
                                        <span key={idx} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications - Only if they exist */}
                {certifications && certifications.length > 0 && (
                    <div>
                        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 border-b border-slate-700 pb-2">Certifications</h3>
                        <div className="space-y-3">
                            {certifications.map((cert, index) => (
                                <div key={index} className="text-sm">
                                    <div className="flex items-start gap-2">
                                        <Award className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                        <div>
                                            <div className="font-medium text-slate-200">{cert.name}</div>
                                            <div className="text-xs text-slate-500">{cert.issuingOrganization} • {cert.dateObtained}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content (Right Column) */}
            <div className="w-[70%] p-8 flex flex-col">
                {/* Header Section */}
                <div className="mb-8 pb-6 border-b-2 border-slate-100">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-transform uppercase">
                        {personalInfo.name}
                    </h1>
                    <h2 className="text-xl text-blue-600 font-medium mt-1 tracking-wide uppercase">
                        {data.targetJobRole || "Professional"}
                    </h2>
                    <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                        {summary}
                    </p>
                </div>

                {/* Experience Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <Award className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900">Experience</h3>
                    </div>

                    <div className="space-y-6 relative border-l-2 border-slate-100 ml-4 pl-6">
                        {experience.map((job, index) => (
                            <div key={index} className="relative">
                                {/* Timeline Dot */}
                                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500"></span>

                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-lg font-bold text-slate-800">{job.jobTitle}</h4>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                                        {job.startDate} - {job.endDate}
                                    </span>
                                </div>

                                <div className="text-blue-600 font-medium text-sm mb-2">{job.company} {job.location && `| ${job.location}`}</div>

                                <ul className="list-disc ml-4 space-y-1">
                                    {job.responsibilities.map((resp, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 leading-relaxed pl-1 marker:text-slate-400">
                                            {resp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects Section */}
                {projects && projects.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                <Globe className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900">Key Projects</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((project, index) => (
                                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800">{project.name}</h4>
                                        {project.link && (
                                            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[150px]">
                                                {project.link.replace(/^https?:\/\//, '')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                                    {project.technologies && (
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="text-[10px] uppercase font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeProfessionalTemplate;
