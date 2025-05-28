import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-indigo max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At ResumeAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our resume analysis and shortlisting service.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Personal information (name, email address, etc.) when you create an account</li>
              <li>Resume data that you upload to our platform</li>
              <li>Job requirement information that you create</li>
              <li>Information about your usage of our services</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We may use the information we collect for various purposes, including to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and analyze resumes using artificial intelligence</li>
              <li>Match resumes with job requirements for shortlisting</li>
              <li>Communicate with you about our services</li>
              <li>Monitor and analyze usage patterns and trends</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the security of your data.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We will retain your information for as long as your account is active or as needed to provide you with our services. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>

            <h2>6. Your Choices</h2>
            <p>You have several choices regarding the use of your information:</p>
            <ul>
              <li>You can update or correct your account information at any time</li>
              <li>You can delete resumes that you have uploaded</li>
              <li>You can close your account and request deletion of your data</li>
            </ul>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us at privacy@resumeai.example.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PrivacyPage;