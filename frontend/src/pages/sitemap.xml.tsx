import { GetServerSidePropsContext } from 'next';

function generateSiteMap() {
	return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${['', 'docs', 'generate', 'privacy-policy', 'terms-and-service'].map(path => (
		 `
       <url>
           <loc>${process.env.NEXTAUTH_URL}${path}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.5</priority>
       </url>
     `
	))
		.join('')}
   </urlset>
 `;
}

function SiteMap() {
	// getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
	// We generate the XML sitemap with the posts data
	const sitemap = generateSiteMap();

	res.setHeader('Content-Type', 'text/xml');
	// we send the XML to the browser
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}

export default SiteMap;