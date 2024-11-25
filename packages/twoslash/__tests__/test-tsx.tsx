///<reference types="svelte" />
;
import { onMount } from 'svelte'
function render() {

  

  let/** @typedef {{ message?: string }} $$ComponentProps *//** @type {$$ComponentProps} */ { message = 'World' } = $props()

  let count = $state(0)

  onMount(() => {
    console.log('mount')
  })
;
async () => {
 { svelteHTML.createElement("button", { "onclick":() => count++,});
    count;
 }
 { svelteHTML.createElement("div", { "class":`text-6`,});
   message;
 }};
return { props: /** @type {$$ComponentProps} */({}), exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const $$Component = __sveltets_2_fn_component(render());
type $$Component = ReturnType<typeof $$Component>;
export default $$Component;