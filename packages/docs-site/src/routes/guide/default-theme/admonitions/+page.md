---
title: Admonitions
---

## Grammar

This feature integrated [remark-directive](https://github.com/remarkjs/remark-directive)

:::important[Icon pre-build required]{icon=tabler:icons}
The iconify icons should be in the [Pre-build iconify icons config](/reference/default-theme/#preBuildIconifyIcons)
:::

```md
:::tip|info|note|warning|important|caution|danger[Title]{icon=icon-collection:icon-name}
Some admonition content
:::
```

## Tip

```md live no-ast
:::tip[Tip title]
Some tip content
:::

:::tip[Tip with custom icon]{icon=ph:smiley}
Some tip content
:::
```

## Info

```md live no-ast
:::info[Info title]
Some info content
:::

:::info[Info with custom icon]{icon=ph:smiley}
Some info content
:::
```

## Note

```md live no-ast
:::note[Note title]
Some note content
:::

:::note[Note with custom icon]{icon=ph:smiley}
Some note content
:::
```

## Warning

```md live no-ast
:::warning[Warning title]
Some warning content
:::

:::warning[Warning with custom icon]{icon=ph:smiley}
Some warning content
:::
```

## Important

```md live no-ast
:::important[Important title]
Some important content
:::

:::important[Important with custom icon]{icon=ph:smiley}
Some important content
:::
```

## Caution

```md live no-ast
:::caution[Caution title]
Some caution content
:::

:::caution[Caution with custom icon]{icon=ph:smiley}
Some caution content
:::
```

## Danger

```md live no-ast
:::danger[Danger title]
Some danger content
:::

:::danger[Danger with custom icon]{icon=ph:smiley}
Some danger content
:::
```

## Links and inline code

Links and inline code inside an admonition inherit the admonition's theme color and background:

```md live no-ast
:::tip[Tip title]
A [tip link](/guide/introduction/) and `tip` both match the tip color.
:::

:::info[Info title]
An [info link](/guide/introduction/) and `info` both match the info color.
:::

:::note[Note title]
A [note link](/guide/introduction/) and `note` both match the note color.
:::

:::warning[Warning title]
A [warning link](/guide/introduction/) and `warning` both match the warning color.
:::

:::important[Important title]
An [important link](/guide/introduction/) and `important` both match the important color.
:::

:::caution[Caution title]
A [caution link](/guide/introduction/) and `caution` both match the caution color.
:::

:::danger[Danger title]
A [danger link](/guide/introduction/) and `danger` both match the danger color.
:::
```
