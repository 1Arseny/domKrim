import { defineConfig } from 'vite'

function resolveBase() {
  // локально и в превью — корень
  let base = '/'

  // в GitHub Actions у нас есть GITHUB_REPOSITORY=owner/repo
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
    base = `/${repo}/`
  }

  // Перезаписать base вручную можно через VITE_BASE
  if (process.env.VITE_BASE) base = process.env.VITE_BASE

  return base
}

export default defineConfig({
  base: resolveBase(),
})
