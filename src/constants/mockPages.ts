export interface MockPageElement {
  id: string;
  selector: string;
  tag: string;
  label: string;
  text: string;
  dataValue: any;
  bounds: { top: number; left: number; width: number; height: number };
}

export interface MockWebpageData {
  url: string;
  title: string;
  favicon: string;
  themeColor: string;
  elements: MockPageElement[];
  rawHtmlPreview: string;
}

export const MOCK_PAGES: Record<string, MockWebpageData> = {
  ecommerce: {
    url: 'https://store.hypertech.io/products/quantum-gpu-x1',
    title: 'HyperTech Store — Quantum GPU-X1 Extreme 24GB',
    favicon: '🛍️',
    themeColor: '#38bdf8',
    elements: [
      {
        id: 'el-title',
        selector: '#product-title',
        tag: 'h1',
        label: 'Product Title',
        text: 'HyperTech Quantum GPU-X1 Extreme Edition (24GB GDDR7)',
        dataValue: 'HyperTech Quantum GPU-X1 Extreme Edition (24GB GDDR7)',
        bounds: { top: 60, left: 30, width: 420, height: 42 },
      },
      {
        id: 'el-discount',
        selector: '.badge-flash-sale',
        tag: 'span',
        label: 'Discount Badge',
        text: '⚡ FLASH SALE: 22% OFF (Limited Time)',
        dataValue: { discountPercentage: 22, saleType: 'flash_sale', timeRemaining: '4h 12m' },
        bounds: { top: 110, left: 30, width: 260, height: 28 },
      },
      {
        id: 'el-price',
        selector: '#current-price',
        tag: 'div',
        label: 'Current Pricing',
        text: '$899.99 (MSRP: $1,149.99)',
        dataValue: { currentPrice: 899.99, originalMsrp: 1149.99, currency: 'USD', variance: -250.00 },
        bounds: { top: 148, left: 30, width: 310, height: 38 },
      },
      {
        id: 'el-stock',
        selector: '#stock-status',
        tag: 'div',
        label: 'Inventory Status',
        text: '🟢 In Stock — Only 4 units remaining in California warehouse',
        dataValue: { inStock: true, unitsAvailable: 4, warehouse: 'US-WEST-CA' },
        bounds: { top: 195, left: 30, width: 380, height: 30 },
      },
      {
        id: 'el-seller',
        selector: '#seller-rating',
        tag: 'div',
        label: 'Merchant Trust Score',
        text: '★ 4.8 / 5.0 (1,420 Verified Reviews) • Official Authorized Reseller',
        dataValue: { rating: 4.8, totalReviews: 1420, authorized: true, sellerTier: 'Platinum' },
        bounds: { top: 235, left: 30, width: 440, height: 30 },
      },
      {
        id: 'el-specs',
        selector: '#specs-table',
        tag: 'table',
        label: 'Hardware Specs',
        text: 'Architecture: TensorCore 5.0 | Memory: 24GB GDDR7 | TDP: 285W | PCIe: 5.0 x16',
        dataValue: { architecture: 'TensorCore 5.0', vram: '24GB GDDR7', tdp: '285W', bus: 'PCIe 5.0' },
        bounds: { top: 275, left: 30, width: 470, height: 48 },
      },
    ],
    rawHtmlPreview: `<div class="product-page">
  <h1 id="product-title">HyperTech Quantum GPU-X1 Extreme Edition (24GB GDDR7)</h1>
  <span class="badge-flash-sale">⚡ FLASH SALE: 22% OFF (Limited Time)</span>
  <div id="current-price" data-price="899.99" data-msrp="1149.99">$899.99 <del>$1,149.99</del></div>
  <div id="stock-status" data-stock="4">🟢 In Stock — Only 4 units remaining in CA</div>
  <div id="seller-rating" data-score="4.8">★ 4.8 / 5.0 (1,420 Verified Reviews)</div>
  <table id="specs-table">
    <tr><td>Architecture</td><td>TensorCore 5.0</td></tr>
    <tr><td>VRAM</td><td>24GB GDDR7</td></tr>
    <tr><td>TDP</td><td>285W</td></tr>
  </table>
</div>`,
  },
  news: {
    url: 'https://chronicle-wire.org/tech/breakthrough-genx-enzymes',
    title: 'Chronicle Wire — Synthetic Biology Startup GenX Pilot Report',
    favicon: '📰',
    themeColor: '#a855f7',
    elements: [
      {
        id: 'el-headline',
        selector: '#article-headline',
        tag: 'h1',
        label: 'Article Headline',
        text: 'GenX Demonstrates Carbon-Negative Industrial Enzyme Synthesis at Scale',
        dataValue: 'GenX Demonstrates Carbon-Negative Industrial Enzyme Synthesis at Scale',
        bounds: { top: 60, left: 30, width: 480, height: 46 },
      },
      {
        id: 'el-author',
        selector: '#author-meta',
        tag: 'div',
        label: 'Author & Publication',
        text: 'Dr. Elena Rostova, Senior Biotech Editor • Published Nov 12, 2026',
        dataValue: { author: 'Dr. Elena Rostova', affiliation: 'Institute of Applied Genomics', publishedDate: '2026-11-12' },
        bounds: { top: 115, left: 30, width: 430, height: 26 },
      },
      {
        id: 'el-claim',
        selector: '#key-claim-statement',
        tag: 'blockquote',
        label: 'Target Premise Claim',
        text: '"Our pilot bioreactor sequestered 10.4 kg of CO2 equivalent per kilogram of active protease generated."',
        dataValue: { co2SequesteredPerKg: 10.4, metricUnit: 'kg CO2e / kg protease', verificationStatus: 'Unconfirmed' },
        bounds: { top: 150, left: 30, width: 470, height: 50 },
      },
      {
        id: 'el-citations',
        selector: '#doi-links',
        tag: 'ul',
        label: 'Peer-Review Citations',
        text: 'DOI: 10.1038/s41587-026-00412-x (Nature Biotechnology, In Press)',
        dataValue: { doi: '10.1038/s41587-026-00412-x', journal: 'Nature Biotechnology', peerReviewed: true },
        bounds: { top: 210, left: 30, width: 460, height: 35 },
      },
      {
        id: 'el-funding',
        selector: '#conflict-disclosure',
        tag: 'div',
        label: 'Conflict of Interest',
        text: 'Disclosures: Pilot funded in part by GreenFuture Ventures ($4.5M seed).',
        dataValue: { fundedBy: 'GreenFuture Ventures', amount: '$4.5M', independentAudit: false },
        bounds: { top: 255, left: 30, width: 450, height: 32 },
      },
    ],
    rawHtmlPreview: `<article class="editorial-piece">
  <h1 id="article-headline">GenX Demonstrates Carbon-Negative Industrial Enzyme Synthesis</h1>
  <div id="author-meta">Dr. Elena Rostova • Published Nov 12, 2026</div>
  <blockquote id="key-claim-statement">"Our pilot bioreactor sequestered 10.4 kg of CO2 equivalent..."</blockquote>
  <ul id="doi-links"><li>DOI: 10.1038/s41587-026-00412-x</li></ul>
  <div id="conflict-disclosure">Disclosures: Funded in part by GreenFuture Ventures ($4.5M)</div>
</article>`,
  },
};
