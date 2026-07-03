import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | StrokeLab',
  description: 'Learn how StrokeLab collects, uses, and protects your personal data.',
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 29, 2026</p>

        <div className="mt-10 prose prose-sm max-w-none text-muted-foreground space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-3 leading-relaxed">
              StrokeLab ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. Please read this policy carefully. By using StrokeLab, you consent to the data practices described herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <h3 className="mt-4 text-lg font-medium text-foreground">2.1 Personal Data</h3>
            <p className="mt-2 leading-relaxed">
              We may collect personal information that you voluntarily provide to us when you register, use our services, or contact us, including:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Name and email address (via Google OAuth sign-in)</li>
              <li>Profile picture (via Google OAuth)</li>
              <li>Payment information (processed securely by Stripe; we do not store card details)</li>
              <li>Usage data and analysis history</li>
            </ul>

            <h3 className="mt-4 text-lg font-medium text-foreground">2.2 Automatically Collected Data</h3>
            <p className="mt-2 leading-relaxed">
              When you access StrokeLab, we may automatically collect:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>Log data (IP address, access times, pages viewed, referring URL)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="mt-4 text-lg font-medium text-foreground">2.3 Uploaded Content</h3>
            <p className="mt-2 leading-relaxed">
              Photos you upload for stroke analysis are processed in real-time and stored temporarily for the purpose of providing our service. Keypoint data and analysis results are retained in your account history. You may request deletion of this data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="mt-3 leading-relaxed">We use the information we collect for the following purposes:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>To provide, operate, and maintain our services</li>
              <li>To process and complete analysis requests</li>
              <li>To manage your account and subscription</li>
              <li>To communicate with you regarding updates, support, and security notices</li>
              <li>To improve our services, user experience, and performance</li>
              <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Legal Basis for Processing (GDPR)</h2>
            <p className="mt-3 leading-relaxed">
              If you are a resident of the European Economic Area (EEA), we process your personal data based on the following legal grounds:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Consent:</strong> You have given explicit consent for specific purposes</li>
              <li><strong>Contract:</strong> Processing is necessary for the performance of our service agreement</li>
              <li><strong>Legitimate Interests:</strong> We have a legitimate interest in providing and improving our services, provided your rights are not overridden</li>
              <li><strong>Legal Obligation:</strong> Processing is required to comply with applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Data Sharing and Disclosure</h2>
            <p className="mt-3 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Service Providers:</strong> Trusted third-party vendors who assist in operating our services (e.g., Cloudflare for storage, Stripe for payments, Vercel for hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you have explicitly authorized us to do so</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. International Data Transfers</h2>
            <p className="mt-3 leading-relaxed">
              Your data may be transferred to and processed in countries outside of your country of residence, including the United States. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws, including Standard Contractual Clauses where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Data Retention</h2>
            <p className="mt-3 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Uploaded photos are processed and deleted after analysis unless you choose to save them. Account data is retained while your account is active; you may request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights (GDPR & CCPA)</h2>
            <p className="mt-3 leading-relaxed">Depending on your location, you may have the following rights:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we relied on it</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@strokelab.app" className="text-primary hover:underline">
                privacy@strokelab.app
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
            <p className="mt-3 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze usage patterns. You can control cookies through your browser settings; however, disabling certain cookies may limit your ability to use some features of our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Security</h2>
            <p className="mt-3 leading-relaxed">
              We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL), secure authentication via OAuth, and restricted access to personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Children's Privacy</h2>
            <p className="mt-3 leading-relaxed">
              StrokeLab is not directed to children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Changes to This Policy</h2>
            <p className="mt-3 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Contact Us</h2>
            <p className="mt-3 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 rounded-lg bg-muted p-4">
              <p className="font-medium text-foreground">StrokeLab Privacy Team</p>
              <p>Email: <a href="mailto:privacy@strokelab.app" className="text-primary hover:underline">privacy@strokelab.app</a></p>
              <p>Website: <a href="https://strokelab.app" className="text-primary hover:underline">strokelab.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
