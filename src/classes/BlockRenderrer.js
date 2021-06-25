export class BlockRenderrer {
  static render(config, block) {
    const type = block.getType()
    return config[type]
  }
}

