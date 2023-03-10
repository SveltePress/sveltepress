import adapter from '@sveltejs/adapter-static'

const adapterWrapper = options => {
  return {
    name: '@sveltepress/adapter',
    async adapt(builder) {
      builder.rimraf('.sveltepress/prerendered')
      builder.writePrerendered('.sveltepress/prerendered')
      adapter(options).adapt(builder)
    },
  }
}

export default adapterWrapper
