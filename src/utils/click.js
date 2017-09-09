export default (elem) => {
  if (!elem) return;
  const active = document.activeElement;
  elem.click();
  active.focus();
  active.dispatchEvent(new Event('focus'));
};
