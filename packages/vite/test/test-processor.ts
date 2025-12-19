/* eslint-disable no-console */

import mdToSvelte from '../src/markdown/md-to-svelte'

const testMarkdown = `
# Test Image Processing

This is a test page with local images.

![Test Image](img1.jpg)

![Test Image](./img1.jpg)

![Another Image](../img1.jpg)

![Another Image](child/img1.jpg)
`

async function test() {
  try {
    const result = await mdToSvelte({
      mdContent: testMarkdown,
      filename: './about/+page.md',
    })

    console.log('SUCCESS:')
    console.log('Code:', result.code)
    console.log('Data:', result.data)
  }
  catch (error) {
    console.error('ERROR:', error)
  }
}

test()
