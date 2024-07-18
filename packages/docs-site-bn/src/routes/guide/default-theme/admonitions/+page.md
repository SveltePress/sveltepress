---
title: Admonitions
---

## Grammar

This feature integrated [remark-directive](https://github.com/remarkjs/remark-directive) 

:::important[Icon pre-build required]{icon=tabler:icons}
The iconify icons should be in the [Pre-build iconify icons config](/reference/default-theme/#preBuildIconifyIcons)
:::

```md
:::tip|info|note|warning|important|caution[Title]{icon=icon-collection:icon-name}
Some admonition content
:::
```

## Tip

```md live
:::tip[Tip title]
Some tip content  
:::

:::tip[Tip with custom icon]{icon=ph:smiley}
Some tip content
:::
```

## Info

```md live
:::info[Info title]
Some info content
:::

:::info[Info with custom icon]{icon=ph:smiley}
Some info content
:::
```

## Note

```md live
:::note[Note title]
Some note content
:::

:::note[Note with custom icon]{icon=ph:smiley}
Some note content
:::
```

## Warning

```md live
:::warning[Warning title]
Some warning content
:::

:::warning[Warning with custom icon]{icon=ph:smiley}
Some warning content
:::
```
## Important

```md live
:::important[Important title]
Some important content
:::

:::important[Important with custom icon]{icon=ph:smiley}
Some important content
:::
```

## Caution
```md live
:::caution[Caution title]
Some caution content
:::

:::caution[Caution with custom icon]{icon=ph:smiley}
Some caution content
:::
```
