/* eslint-disable no-console */
import { wrapPage } from '../src/utils/wrap-page'

async function testWrapPage() {
  try {
    // Simulate what would happen in the markdown processing pipeline
    const mockLayout = '<script>import ThemeLayout from "./layout.svelte"</script><main><slot /></main>'

    const result = await wrapPage({
      layout: mockLayout,
      id: '/test-page.md',
      mdOrSvelteCode: `<h1>Test Image Processing</h1>
<p>This is a test page with local images.</p>
<p><img src="\${__img_0}" alt="Test Image"></p>
<p><img src="\${__img_1}" alt="Another Image"></p>`,
      imageImports: [
        { importName: '__img_0', relativePath: 'test-image.jpg' },
        { importName: '__img_1', relativePath: 'test-image.png' },
      ],
    })

    console.log('SUCCESS - Wrapped page:')
    console.log(result.wrappedCode)

    // Check if there are duplicate script blocks
    const scriptMatches = result.wrappedCode.match(/<script[^>]*>/g)
    console.log(`Script blocks found: ${scriptMatches ? scriptMatches.length : 0}`)
    if (scriptMatches) {
      console.log('Script blocks:', scriptMatches)
    }

    // Check if image imports are included
    if (result.wrappedCode.includes('__img_0') && result.wrappedCode.includes('test-image.jpg')) {
      console.log('✅ Image imports are correctly included')
    }
    else {
      console.log('❌ Image imports are missing')
    }
  }
  catch (error) {
    console.error('ERROR:', error)
  }
}

testWrapPage()
