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
  -V, --version                output the version number
  -p, --port                   specify port used for serving the websites
  --setEntries <entries>       specify the buffer size used in the profiler (default: "20000000")
  --setInterval <interval>     specify the logging interval (ms) (default: "100")
  --setFeatures <features...>  specify the logged features. Available features: stackwalk, js, cpu, memory, nostacksampling, mainthreadio, fileioall, nomarkerstacks, seqstyle, screenshots, ipcmessages, jsallocations, audiocallbacktracing, bandwidth,
                               sandbox, flows, cpuallthreads, samplingallthreads, markersallthreads, unregisteredthreads, processcpu, power, tracing (default: ["power"])
  --setThreads <threads...>    specify the logged threads. Available threads: GeckoMain, Compositor, DOM Worker, Renderer, RendererBackend, Timer, StyleThread, Socket Thread, StreamTrans, ImgDecoder, DNS Resolver, TaskController (default:
                               ["GeckoMain"])
  -h, --help                   display help for command
```