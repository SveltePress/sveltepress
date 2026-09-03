<script>
  const { collection, name, ...rest } = $props()
</script>

<div class="i-{collection}-{name}" {...rest}></div>
