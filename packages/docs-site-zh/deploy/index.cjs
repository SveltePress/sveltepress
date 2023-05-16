const path = require('path')
const aliOSSStaicWebDeploy = require('ali-oss-static-web-deploy')

const {
  ALI_OSS_KEY_ID,
  ALI_OSS_KEY_SECRET,
} = process.env

aliOSSStaicWebDeploy({
  region: 'oss-us-east-1',
  accessKeyId: ALI_OSS_KEY_ID,
  accessKeySecret: ALI_OSS_KEY_SECRET,
  bucket: 'sveltepress-cn',
  staticWebAppPath: path.resolve(__dirname, '../dist'),
})
