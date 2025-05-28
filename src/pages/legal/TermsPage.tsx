import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-indigo max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using ResumeAI's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              ResumeAI provides an AI-powered resume analysis and candidate shortlisting platform. Our services include resume parsing, skill extraction, candidate matching, and shortlisting against job requirements.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of our service, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>

            <h2>4. User Content</h2>
            <p>
              Our service allows you to upload, store, and process resumes and job requirements. You retain all rights to your content, but you grant us a license to use, process, and analyze this content to provide our services.
            </p>
            <p>
              You represent and warrant that you have all necessary rights to upload and process the resumes you submit to our platform, including appropriate consent from the candidates.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to use our services to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload or transmit malicious code or content</li>
              <li>Attempt to gain unauthorized access to our systems or data</li>
              <li>Use our services for discriminatory hiring practices</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>
              The ResumeAI service, including its software, design, text, graphics, and other content, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our service without our express permission.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              ResumeAI provides its services on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of our services.
            </p>
            <p>
              In no event shall ResumeAI be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services.
            </p>

            <h2>8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to our services at any time, for any reason, without notice.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. We will notify you of any changes by posting the updated terms on our website. Your continued use of our services after such modifications constitutes your acceptance of the revised terms.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at terms@resumeai.example.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TermsPage;