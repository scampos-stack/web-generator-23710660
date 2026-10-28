export interface MockupInput {
  businessName: string;
  phone: string;
  address: string;
  city: string;
  mainService: string;
  services: string[];
  trustPoints: [string, string, string];
  about: string;
  primaryColor: string;
  accentColor: string;
  titleTag: string;
  metaDescription: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMockupHtml(input: MockupInput): string {
  const year = new Date().getFullYear();
  const telHref = `tel:${input.phone.replace(/[^0-9+]/g, "")}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(input.titleTag)}</title>
<meta name="description" content="${esc(input.metaDescription)}" />
<style>
  :root { --primary: ${input.primaryColor}; --accent: ${input.accentColor}; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1f2430; background: #fff; }
  header { position: sticky; top: 0; background: var(--primary); color: #fff; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; z-index: 10; }
  header .brand { font-weight: 700; font-size: 16px; }
  header a.phone { color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.6); border-radius: 6px; padding: 6px 10px; }
  .hero { background: #f4f5f7; padding: 36px 16px; text-align: center; }
  .hero h1 { margin: 0 0 10px; font-size: 24px; line-height: 1.3; color: var(--primary); }
  .hero p { margin: 0 0 18px; color: #4a5160; font-size: 15px; }
  .cta { display: inline-block; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; padding: 12px 22px; border-radius: 8px; font-size: 15px; }
  .trust { display: flex; flex-wrap: wrap; gap: 10px; padding: 20px 16px; justify-content: center; }
  .trust span { background: #fff; border: 1px solid #e3e5ea; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; color: var(--primary); }
  section { padding: 28px 16px; }
  section h2 { font-size: 18px; color: var(--primary); margin-bottom: 14px; }
  .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 12px; }
  .services .card { border: 1px solid #e3e5ea; border-radius: 8px; padding: 14px; }
  .placeholder-img { background: #e3e5ea; color: #6b7280; height: 90px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-bottom: 8px; }
  .about p { font-size: 14px; line-height: 1.6; color: #4a5160; }
  form { display: flex; flex-direction: column; gap: 10px; max-width: 420px; }
  form input, form textarea { padding: 10px; border: 1px solid #d0d3d9; border-radius: 6px; font-size: 14px; }
  form button { background: var(--primary); color: #fff; border: none; border-radius: 6px; padding: 12px; font-weight: 700; font-size: 14px; }
  footer { background: #1f2430; color: #c8cad1; padding: 20px 16px; font-size: 12px; text-align: center; }
</style>
</head>
<body>
  <header>
    <span class="brand">${esc(input.businessName)}</span>
    <a class="phone" href="${telHref}">${esc(input.phone)}</a>
  </header>

  <section class="hero">
    <h1>${esc(input.mainService)} in ${esc(input.city)}</h1>
    <p>${esc(input.about.split(".")[0])}.</p>
    <a class="cta" href="${telHref}">Call ${esc(input.businessName)} Now</a>
  </section>

  <div class="trust">
    ${input.trustPoints.map((t) => `<span>${esc(t)}</span>`).join("\n    ")}
  </div>

  <section>
    <h2>Services</h2>
    <div class="services">
      ${input.services
        .map(
          (s) => `<div class="card">
        <div class="placeholder-img">Photo placeholder</div>
        <div>${esc(s)}</div>
      </div>`
        )
        .join("\n      ")}
    </div>
  </section>

  <section class="about">
    <h2>About ${esc(input.businessName)}</h2>
    <p>${esc(input.about)}</p>
  </section>

  <section>
    <h2>Request a Callback</h2>
    <form onsubmit="return false;">
      <input type="text" placeholder="Name" />
      <input type="tel" placeholder="Phone" />
      <textarea placeholder="What do you need help with?" rows="3"></textarea>
      <button type="submit">Send</button>
    </form>
  </section>

  <footer>
    ${esc(input.businessName)} · ${esc(input.address)} · ${esc(input.phone)}<br />
    &copy; ${year} ${esc(input.businessName)}. All rights reserved.
  </footer>
</body>
</html>`;
}
