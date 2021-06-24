import { Agnoponent } from '../components'

export const blockRenderer = (block) => {
  const type = block.getType()
  console.log('block', block)
  if (type === 'atomic') {
    return {
      component: Agnoponent,
      editable: false,
    }
  }
  return null
}
