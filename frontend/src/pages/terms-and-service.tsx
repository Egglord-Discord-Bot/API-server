import Header from '../components/header';
import Footer from '../components/navbar/footer';
import Navbar from '../components/navbar/main';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Props {
 domain: string
}

export default function TermsServices({ domain }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	return (
		<>
			<Header />
			<Navbar user={session?.user} />
			<div className="container">
				<h1>Terms of Service</h1>
				<div id="terms">
					<h4>1. Terms</h4>
					<p>By accessing the website at <Link href={domain}>{domain}</Link>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
				</div>
				<div id="disclaimer">
					<h4>2. Disclaimer</h4>
					<p>The materials on Team Egglord website are provided on an as is basis. Team Egglord makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          Further, Team Egglord does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>
				</div>
				<div id="limitations">
					<h4>3. Limitations</h4>
					<p>In no event shall Team Egglord or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Team Egglords website, even if Team Egglord or a Team Egglord authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
				</div>
				<div id="accuracy">
					<h4>4. Accuracy of materials</h4>
          The materials appearing on Team Egglord s website could include technical, typographical, or photographic errors. Team Egglord does not warrant that any of the materials on its website are accurate, complete or current. Team Egglord may make changes to the materials contained on its website at any time without notice. However Team Egglord does not make any commitment to update the materials.
				</div>
				<div id="links">
					<h4>5. Links</h4>
          Team Egglord has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Team Egglord of the site. Use of any such linked website is at the users own risk.
				</div>
				<div id="modification">
					<h4>6. Modifications</h4>
          Team Egglord may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
				</div>
				<div id="law">
					<h4>7. Governing Law</h4>
          These terms and conditions are governed by and construed in accordance with the laws of England and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
				</div>
			</div>
			<Footer />
		</>
	);
}

export async function getServerSideProps() {
	return { props: { domain: process.env.NEXTAUTH_URL } };
}
