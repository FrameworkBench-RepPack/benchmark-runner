# Benchmark Runner
A CLI tool for running performance-based benchmarks in the Firefox Browser using Selenium and the Firefox Profiler.

## Setup
### 1. Clone the Repository
To clone the repository run the following git command:
```bash
git clone https://github.com/FrameworkBench-RepPack/benchmark-runner.git
cd ./benchmark-runner
```

### 2. Configure the Project
After cloning, initialize and install dependencies:
```bash
git submodule update --remote --merge
npm install
```

## Running the Benchmark Runner
The project provides a single script:
```bash 
npm run bm
```

To view available options and usage details, run:
```bash
npm run bm -- --help
```
This outputs the following:
```
> benchmark-runner@1.0.0 bm
> tsx src/index.ts --help

Usage: Benchmark Runner [options]

A CLI for running performance focused benchmarks in the Firefox browser, using selenium

Options:
  -V, --version                   output the version number
  -p, --port                      specify port used for serving the websites
  --entries <entries>             specify the buffer size used in the profiler (default: "20000000")
  --interval <interval>           specify the profiler logging interval (ms) (default: "100")
  --features <features...>        specify the logged features. Available features: stackwalk, js, cpu, memory, nostacksampling, mainthreadio, fileioall, nomarkerstacks, seqstyle, screenshots, ipcmessages, jsallocations, audiocallbacktracing, bandwidth, sandbox, flows, cpuallthreads, samplingallthreads, markersallthreads, unregisteredthreads, processcpu, power, tracing (default: ["power"])
  --threads <threads...>          specify the logged threads. Available threads: GeckoMain, Compositor, DOM Worker, Renderer, RendererBackend, Timer, StyleThread, Socket Thread, StreamTrans, ImgDecoder, DNS Resolver, TaskController (default: ["GeckoMain"])
  --repetitions <repetitions...>  specify the number of test repetitions (default: "1")
  --benchmarks <benchmarks...>    specify the benchmarks. Available benchmarks: navigate-all-pages, subpage-faq, subpage-list, subpage-live, subpage-static, subpage-tooltip
  --frameworks <frameworks...>    specify the frameworks. Available frameworks: qwik-qwik-city, svelte-astro, svelte-sveltekit, svelte-vite-svelte5-router, vanilla, vanilla-astro, vanilla-vite, vue-astro, vue-nuxt, vue-vite
  -h, --help                      display help for command
```

## License
This project is licensed under the [MIT License](https://github.com/FrameworkBench-RepPack/benchmark-runner/blob/main/LICENSE).