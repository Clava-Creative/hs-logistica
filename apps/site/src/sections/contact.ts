import { T, esc, wa, ARROW, type Ctx } from './html';

export const contact = ({ c, admin }: Ctx): string => {
  const show = (v: string): boolean => admin || !!v;
  const row = (label: string, inner: string): string => `<div class="rowi"><span class="k">${label}</span>${inner}</div>`;
  return `
<section class="close veil-full" id="contato"><div class="wrap cgrid">
  <div>
    <div class="head">${T('contact.title', 'h2')}${T('contact.sub', 'p', 'lead')}</div>
    <div class="info">
      ${show(c.contact.address) ? row('Endereço', T('contact.address', 'span', '', 'Adicionar endereço')) : ''}
      ${show(c.contact.phone) ? row('Telefone', T('contact.phone', 'span', '', 'Adicionar telefone')) : ''}
      ${show(c.contact.whatsapp) ? row('WhatsApp', admin ? T('contact.whatsapp', 'span', '', 'Adicionar número com DDD') : `<a href="${wa(c.contact.whatsapp)}" target="_blank" rel="noopener">${esc(c.contact.whatsapp)}</a>`) : ''}
      ${show(c.contact.email) ? row('E-mail', T('contact.email', 'span', '', 'Adicionar e-mail')) : ''}
      ${show(c.contact.hours) ? row('Horário', T('contact.hours', 'span', '', 'Adicionar horário')) : ''}
    </div>
  </div>
  <form class="quote surface" id="quote" novalidate>
    <label for="q-name">Nome ou empresa<input id="q-name" name="name" maxlength="120" autocomplete="organization"><span class="err" id="e-name"></span></label>
    <label for="q-contact">Telefone ou e-mail<input id="q-contact" name="contact" maxlength="120"><span class="err" id="e-contact"></span></label>
    <label for="q-service">Serviço<select id="q-service" name="service">${c.services.items.map((s) => `<option>${esc(s.t)}</option>`).join('')}<option>Outro</option></select></label>
    <label for="q-msg">Sobre a carga<textarea id="q-msg" name="message" maxlength="2000" placeholder="Produto, volume e prazo"></textarea></label>
    <button class="btn btn-primary" type="submit">Enviar pedido de cotação${ARROW}</button>
    <p class="msg" id="q-out" role="status"></p>
  </form>
</div></section>`;
};
