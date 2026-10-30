// Brand rule: JMAtv is written "JMA" with a smaller "TV".
export function JmaTv() {
  return <span className="whitespace-nowrap">JMA<span style={{ fontSize: '0.72em' }}>TV</span></span>;
}

export function brand(text) {
  if (typeof text !== 'string' || !/jmatv/i.test(text)) return text;
  return text.split(/(jmatv)/i).map((part, i) => (i % 2 ? <JmaTv key={i} /> : part));
}
