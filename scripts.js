//Replace the value https://XXXXXXXXXXXXXXXXXX with your URL, and location/xxxxxxxxxxxxxxx with the ID instead of the x’s.


<script>
(() => {
  "use strict";

  // ====== Config ======
  const LOCATION_OK = /\/location\/xxxxxxxxxxxxxxx\//.test(location.pathname);
  if (!LOCATION_OK) return;

  const SELECTORS = {
    board: '[data-testid="opportunities"]',
    card: ".opportunitiesCard.ui-card",
    content: ".ui-card-content",
  };
  const ENDPOINT = "https://XXXXXXXXXXXXXXXXXX";
  const BTN_ATTR = "data-ghl-testbtn";

  // ====== CSS ======
  if (!document.getElementById("ghl-modal-style")) {
    const s = document.createElement("style");
    s.id = "ghl-modal-style";
    s.textContent = `
      ${SELECTORS.card} ${SELECTORS.content}{position:relative}
      .ghl-testbtn-wrap{position:absolute;right:8px;bottom:8px;z-index:2}
      /* Botón azul Form */
      .ghl-testbtn{
        display:inline-flex;align-items:center;padding:4px 10px;
        font-size:11px;line-height:1;border:none;border-radius:6px;
        background:#2563eb;color:#fff;cursor:pointer;user-select:none;
        transition:background .2s ease
      }
      .ghl-testbtn:hover{background:#1d4ed8}
      .ghl-testbtn:active{background:#1e40af}
      .ghl-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.3);display:none;align-items:center;justify-content:center;z-index:9999}
      .ghl-modal{width:100%;max-width:420px;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);padding:16px;box-sizing:border-box}
      .ghl-modal-header{font-weight:600;font-size:15px;margin-bottom:4px}
      .ghl-modal-subheader{font-size:12px;color:#667085;margin-bottom:10px}
      .ghl-modal-body{display:grid;gap:10px}
      .ghl-input{width:100%;height:32px;padding:6px 10px;font-size:13px;border:1px solid #d0d5dd;border-radius:6px;outline:none}
      .ghl-input:focus{border-color:#98a2b3}
      .ghl-modal-footer{margin-top:12px;display:flex;justify-content:flex-end;gap:8px}
      .ghl-btn{padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:none}
      .ghl-btn.primary{background:#2563eb;color:#fff}
      .ghl-btn.primary:hover{background:#1d4ed8}
      .ghl-btn.primary:active{background:#1e40af}
      .ghl-btn[disabled]{opacity:.6;cursor:not-allowed}
      .ghl-help{font-size:12px;color:#667085}
      .ghl-small{font-size:11px;color:#98a2b3}
    `;
    document.head.appendChild(s);
  }

  // ====== Modal ======
  const ensureModal = () => {
    if (document.getElementById("ghl-modal-backdrop")) return;
    const bd = document.createElement("div");
    bd.id = "ghl-modal-backdrop";
    bd.className = "ghl-modal-backdrop";
    bd.innerHTML = `
      <div class="ghl-modal" role="dialog" aria-modal="true">
        <div class="ghl-modal-header">Enviar datos de prueba</div>
        <div id="ghl-modal-subheader" class="ghl-modal-subheader"></div>
        <div class="ghl-modal-body">
          <input id="ghl-input-1" class="ghl-input" type="text" placeholder="Campo 1" />
          <input id="ghl-input-2" class="ghl-input" type="text" placeholder="Campo 2" />
          <div class="ghl-help">Se enviará también <span class="ghl-small">locationId, opportunityId y contactId (si existen).</span></div>
        </div>
        <div class="ghl-modal-footer">
          <button id="ghl-btn-cancel" class="ghl-btn" type="button">Cancelar</button>
          <button id="ghl-btn-submit" class="ghl-btn primary" type="button">Enviar</button>
        </div>
      </div>
    `;
    document.body.appendChild(bd);

    const hide = () => (bd.style.display = "none");
    const show = (ctx) => {
      bd.dataset.locationId   = ctx.locationId || "";
      bd.dataset.opportunityId= ctx.opportunityId || "";
      bd.dataset.contactId    = ctx.contactId || "";
      document.getElementById("ghl-input-1").value = "";
      document.getElementById("ghl-input-2").value = "";
      document.getElementById("ghl-modal-subheader").textContent =
        ctx.opportunityId ? `Opportunity ID: ${ctx.opportunityId}` : "";
      bd.style.display = "flex";
    };

    bd.addEventListener("click", (e) => e.target === bd && hide());
    window.addEventListener("keydown", (e) => e.key === "Escape" && hide());
    document.getElementById("ghl-btn-cancel").addEventListener("click", hide);

    // Submit
    document.getElementById("ghl-btn-submit").addEventListener("click", async () => {
      const submitBtn = document.getElementById("ghl-btn-submit");
      submitBtn.disabled = true;
      try {
        const payload = {
          locationId: bd.dataset.locationId || null,
          opportunityId: bd.dataset.opportunityId || null,
          contactId: bd.dataset.contactId || null,
          input1: document.getElementById("ghl-input-1").value || "",
          input2: document.getElementById("ghl-input-2").value || "",
          source: "ghl-card-modal"
        };
        const r = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error(String(r.status));
        hide();
      } catch (e) {
        alert("No se pudo enviar. Intenta nuevamente.\n" + (e?.message || ""));
      } finally {
        submitBtn.disabled = false;
      }
    });

    ensureModal.show = show;
    ensureModal.hide = hide;
  };

  // ====== Helpers ======
  const getLocationId = () =>
    (location.pathname.match(/\/location\/([^/]+)/) || [])[1] || null;
  const isOpportunityCard = (el) =>
    !!(el.querySelector("[data-contact-id]") || el.querySelector('a[href*="/customers/detail/"]'));
  const getIdsFromCard = (card) => {
    const block = card.querySelector("[data-contact-id]");
    const contactId = block?.getAttribute("data-contact-id") || null;
    const opportunityId =
      block?.id ||
      card.querySelector("[data-opportunity-id]")?.getAttribute("data-opportunity-id") ||
      null;
    return { contactId, opportunityId };
  };

  // ====== Botón en cada card ======
  const processed = new WeakSet();
  const makeBtnWrap = (card) => {
    const wrap = document.createElement("div");
    wrap.className = "ghl-testbtn-wrap";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghl-testbtn";
    btn.setAttribute(BTN_ATTR, "1");
    btn.textContent = "Form";
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      ensureModal();
      const ids = getIdsFromCard(card);
      ensureModal.show({ locationId: getLocationId(), ...ids });
    });
    wrap.appendChild(btn);
    return wrap;
  };

  const inject = (card) => {
    if (processed.has(card) || !isOpportunityCard(card)) return;
    const content = card.querySelector(SELECTORS.content);
    if (!content || content.querySelector(`button[${BTN_ATTR}]`)) { processed.add(card); return; }
    content.appendChild(makeBtnWrap(card));
    processed.add(card);
  };

  const scan = () => { document.querySelectorAll(SELECTORS.card).forEach(inject); };

  // ====== Observer ======
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return; scheduled = true;
    const run = () => { scheduled = false; try { scan(); } catch {} };
    "requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 400 }) : setTimeout(run, 80);
  };
  schedule();

  const board = document.querySelector(SELECTORS.board) || document.body;
  new MutationObserver((m) => {
    for (const x of m) if (x.addedNodes?.length) { schedule(); break; }
  }).observe(board, { childList: true, subtree: true });
})();
</script>
