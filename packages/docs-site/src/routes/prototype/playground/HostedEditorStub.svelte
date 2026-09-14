<script lang="ts">
  import type { EditorStubProps } from './_prototype'
  import { OPEN_IN_STACKBLITZ_HREF } from './_catalog'

  let { entry, boot }: EditorStubProps = $props()
</script>

<section class="stage" data-pagefind-ignore="all" aria-label="Hosted editor">
  {#if boot === 'failed'}
    <div class="failed">
      <p class="failed-title">Hosted editor did not boot</p>
      <p class="failed-copy">
        Open the Starter as authored on stackblitz.com. This does not carry
        iframe edits — there are none if the embed never started.
      </p>
      <a
        class="failed-cta"
        href={OPEN_IN_STACKBLITZ_HREF}
        target="_blank"
        rel="noreferrer"
      >
        Open in StackBlitz
      </a>
    </div>
  {:else}
    <div class="chrome">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="chrome-title">Hosted editor · {entry.starter}</span>
      <span class="chrome-note">stub — StackBlitz is not implemented</span>
    </div>
    <div class="panes">
      <aside class="files" aria-label="Focused file">
        <div class="file-label">Focused file</div>
        <div class="file-path">{entry.focusedFile}</div>
        <div class="file-ghost">src/</div>
        <div class="file-ghost">config/</div>
        <div class="file-ghost">package.json</div>
      </aside>
      <div class="editor" class:loading={boot === 'loading'}>
        {#if boot === 'loading'}
          <p class="status">Booting Hosted editor…</p>
          <p class="status-sub">
            Same-page auto-boot. Playground home never boots.
          </p>
        {:else}
          <pre class="code"><span class="muted">// {entry.focusedFile}</span>
<span class="muted">// visitor edits live in this iframe until Save-fork</span>

export default sveltepress({'{'}
  theme: defaultTheme(),
})</pre>
        {/if}
      </div>
      <div class="preview" class:loading={boot === 'loading'}>
        {#if boot === 'loading'}
          <p class="status">Preview waiting on boot</p>
        {:else}
          <p class="preview-kicker">{entry.group}</p>
          <p class="preview-title">{entry.name}</p>
          <p class="preview-copy">
            Fake preview of the Starter as authored. Not a live WebContainer.
          </p>
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .stage {
    --at-apply: 'flex flex-col min-h-0 min-w-0 flex-1 bg-[#1f1f23] text-zinc-3';
  }
  .chrome {
    --at-apply: 'flex items-center gap-1.5 px-3 h-9 flex-none b-b-1 b-b-solid b-b-white/8 text-[12px]';
  }
  .dot {
    --at-apply: 'w-2 h-2 rounded-full bg-white/20';
  }
  .chrome-title {
    --at-apply: 'ml-2 font-500 text-zinc-2 truncate';
  }
  .chrome-note {
    --at-apply: 'ml-auto text-zinc-5 truncate';
  }
  .panes {
    --at-apply: 'grid min-h-0 flex-1';
    grid-template-columns: minmax(0, 9rem) minmax(0, 1fr) minmax(0, 1fr);
  }
  @media (max-width: 949px) {
    .panes {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
    }
    .files,
    .preview {
      --at-apply: 'hidden';
    }
  }
  .files {
    --at-apply: 'px-3 py-3 text-[12px] b-r-1 b-r-solid b-r-white/8 overflow-auto';
  }
  .file-label {
    --at-apply: 'text-[10px] font-600 text-zinc-5 mb-2';
  }
  .file-path {
    --at-apply: 'text-svp-primary font-600 break-all mb-3';
  }
  .file-ghost {
    --at-apply: 'text-zinc-6 py-0.5';
  }
  .editor,
  .preview {
    --at-apply: 'min-h-[16rem] px-4 py-4 overflow-auto';
  }
  .editor {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
  .loading {
    --at-apply: 'flex flex-col justify-center';
  }
  .status {
    --at-apply: 'm-0 text-[14px] font-600 text-zinc-2';
  }
  .status-sub,
  .preview-copy {
    --at-apply: 'm-0 mt-1 text-[12px] text-zinc-5 leading-5';
  }
  .code {
    --at-apply: 'm-0 text-[12px] leading-6 font-mono whitespace-pre-wrap';
  }
  .muted {
    --at-apply: 'text-zinc-5';
  }
  .preview-kicker {
    --at-apply: 'm-0 text-[11px] text-zinc-5';
  }
  .preview-title {
    --at-apply: 'm-0 mt-1 text-[18px] font-700 text-zinc-1';
  }
  .failed {
    --at-apply: 'flex-1 flex flex-col items-start justify-center gap-3 px-6 py-10 min-h-[16rem]';
  }
  .failed-title {
    --at-apply: 'm-0 text-[18px] font-700 text-zinc-1';
  }
  .failed-copy {
    --at-apply: 'm-0 max-w-[36rem] text-[13px] leading-6 text-zinc-4';
  }
  .failed-cta {
    --at-apply: 'inline-flex items-center h-10 px-4 rounded-full bg-white text-[#18181b] font-600 text-[13px] no-underline';
  }
</style>
