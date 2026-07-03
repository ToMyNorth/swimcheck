import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | StrokeLab',
  description: 'Read the terms and conditions for using StrokeLab services.',
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 29, 2026</p>

        <div className="mt-10 prose prose-sm max-w-none text-muted-foreground space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-3 leading-relaxed">
              By accessing or using StrokeLab ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any revisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="mt-3 leading-relaxed">
              StrokeLab provides AI-powered swimming stroke analysis services. Users can upload swimming photos to receive automated feedback on technique, including pose estimation, scoring, and improvement suggestions. The Service is available via web browser on a subscription or freemium basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <h3 className="mt-4 text-lg font-medium text-foreground">3.1 Registration</h3>
            <p className="mt-2 leading-relaxed">
              To access certain features, you must create an account using Google OAuth. You agree to provide accurate information and maintain the security of your account credentials.
            </p>
            <h3 className="mt-4 text-lg font-medium text-foreground">3.2 Account Responsibility</h3>
            <p className="mt-2 leading-relaxed">
              You are responsible for all activity under your account. You must notify us immediately of any unauthorized use or security breach at{' '}
              <a href="mailto:support@strokelab.app" className="text-primary hover:underline">support@strokelab.app</a>.
            </p>
            <h3 className="mt-4 text-lg font-medium text-foreground">3.3 Account Termination</h3>
            <p className="mt-2 leading-relaxed">
              We reserve the right to suspend or terminate your account at our discretion, including for violations of these Terms. You may delete your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Subscriptions and Payments</h2>
            <h3 className="mt-4 text-lg font-medium text-foreground">4.1 Free Tier</h3>
            <p className="mt-2 leading-relaxed">
              The free tier includes up to 3 analyses per month with basic scoring metrics. No payment information is required.
            </p>
            <h3 className="mt-4 text-lg font-medium text-foreground">4.2 Paid Plans</h3>
            <p className="mt-2 leading-relaxed">
              Paid subscriptions (Basic and Pro tiers) are billed monthly via Stripe. Prices are as displayed on our Pricing page and are subject to change with 30 days' notice.
            </p>
            <h3 className="mt-4 text-lg font-medium text-foreground">4.3 Cancellation & Refunds</h3>
            <p className="mt-2 leading-relaxed">
              You may cancel your subscription at any time from your dashboard. Your access will continue until the end of the current billing period. Refunds are provided at our discretion for billing errors; unused portions of subscriptions are not refunded.
            </p>
            <h3 className="mt-4 text-lg font-medium text-foreground">4.4 Price Changes</h3>
            <p className="mt-2 leading-relaxed">
              We may adjust pricing for paid plans. Existing subscribers will be notified at least 30 days before any price increase takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
            <p className="mt-3 leading-relaxed">You agree not to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of applicable laws</li>
              <li>Upload content that infringes on others' intellectual property or privacy rights</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Share your account credentials or allow unauthorized access</li>
              <li>Resell or redistribute the Service without written authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p className="mt-3 leading-relaxed">
              All content, features, and functionality of the Service (including but not limited to software, algorithms, AI models, text, graphics, and logos) are owned by StrokeLab and protected by copyright, trademark, and other intellectual property laws. You retain ownership of the photos you upload but grant us a limited license to process them for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Disclaimer of Warranties</h2>
            <p className="mt-3 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. StrokeLab does not guarantee that the Service will be uninterrupted, error-free, or that the analysis results are medically or professionally accurate. The Service is intended for informational and training purposes only and should not replace professional coaching or medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="mt-3 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, StrokeLab SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR PERSONAL INJURY RESULTING FROM USE OF THE SERVICE. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Indemnification</h2>
            <p className="mt-3 leading-relaxed">
              You agree to indemnify, defend, and hold harmless StrokeLab, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Governing Law</h2>
            <p className="mt-3 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the state or federal courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Dispute Resolution</h2>
            <p className="mt-3 leading-relaxed">
              Any dispute arising from or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to binding arbitration in accordance with the rules of the American Arbitration Association. You retain the right to bring claims in small claims court where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Changes to Terms</h2>
            <p className="mt-3 leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be notified via email or prominent notice on our website at least 30 days before taking effect. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Severability</h2>
            <p className="mt-3 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">14. Contact Us</h2>
            <p className="mt-3 leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 rounded-lg bg-muted p-4">
              <p className="font-medium text-foreground">StrokeLab Legal Team</p>
              <p>Email: <a href="mailto:legal@strokelab.app" className="text-primary hover:underline">legal@strokelab.app</a></p>
              <p>Website: <a href="https://strokelab.app" className="text-primary hover:underline">strokelab.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
