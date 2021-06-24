import { Agnoponent } from '../components'

export const blockRenderer = (block) => {
  const type = block.getType()
  if (type === 'atomic') {
    return {
      component: Agnoponent,
      editable: false,
    }
  }
  return null
}
