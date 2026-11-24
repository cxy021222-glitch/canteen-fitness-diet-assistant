#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 纯静态 SPA 构建：产物直接可被任意静态服务托管
cd "$ROOT"
export NODE_ENV="${NODE_ENV:-production}"
npx vite build

echo "Build complete → dist/public/"
