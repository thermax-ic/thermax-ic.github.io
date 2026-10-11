// All editable translations are explicit pairs generated from content/*.json.
document.addEventListener('DOMContentLoaded', () => {
  let language = 'en';
  try { language = localStorage.getItem('siteLanguage') === 'zh' ? 'zh' : 'en'; } catch {}
  function applyLanguage(next) {
    language = next;
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.toggle('lang-zh', next === 'zh');
    document.body.classList.toggle('lang-en', next === 'en');
    document.querySelectorAll('[data-i18n-en]').forEach(element => {
      const en = element.getAttribute('data-i18n-en') || '';
      const zh = element.getAttribute('data-i18n-zh') || en;
      const text = next === 'zh' ? zh : en;
      const attribute = element.getAttribute('data-i18n-attribute');
      if (attribute) element.setAttribute(attribute, text);
      else element.textContent = text;
    });
    document.querySelectorAll('[data-i18n-alt-en]').forEach(element => {
      element.setAttribute('alt', next === 'zh'
        ? element.getAttribute('data-i18n-alt-zh') || element.getAttribute('data-i18n-alt-en')
        : element.getAttribute('data-i18n-alt-en'));
    });
    document.querySelectorAll('[data-i18n-placeholder-en]').forEach(element => {
      element.setAttribute('placeholder', next === 'zh'
        ? element.getAttribute('data-i18n-placeholder-zh') || element.getAttribute('data-i18n-placeholder-en')
        : element.getAttribute('data-i18n-placeholder-en'));
    });
    document.querySelectorAll('.language-toggle').forEach(button => {
      button.dataset.lang = next;
      button.setAttribute('aria-label', next === 'zh' ? '切换到英文' : 'Switch to Chinese');
      button.setAttribute('title', next === 'zh' ? '切换到英文' : 'Switch to Chinese');
    });
    try { localStorage.setItem('siteLanguage', next); } catch {}
    document.dispatchEvent(new CustomEvent('site-language-change', { detail: { language: next } }));
  }
  document.querySelectorAll('.language-toggle').forEach(button => {
    button.addEventListener('click', () => applyLanguage(language === 'en' ? 'zh' : 'en'));
  });
  applyLanguage(language);
});
