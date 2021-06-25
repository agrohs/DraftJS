export default function getTypeByTrigger(trigger) {
  return trigger === '@' ? 'mention' : `${trigger}mention`;
}
