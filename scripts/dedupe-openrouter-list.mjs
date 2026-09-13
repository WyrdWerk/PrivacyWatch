#!/usr/bin/env node
// One-off: classify the OpenRouter provider list against existing providers.json coverage.
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('providers.json', 'utf-8'));
const norm = (u) => (u ?? '').toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
const existing = new Map();
for (const p of data.providers) existing.set(norm(p.sourceUrl), `${p.id} (${p.name} / ${p.surface})`);

const list = [
  ['Cerebras', 'https://www.cerebras.ai/terms-of-service'],
  ['Morph', 'https://www.morphllm.com/privacy/tos'],
  ['StepFun', 'https://platform.stepfun.ai/docs/en/agreement/userservice'],
  ['Deepgram', 'https://deepgram.com/terms'],
  ['Voyage AI by MongoDB', 'https://www.voyageai.com/tos'],
  ['Black Forest Labs', 'https://bfl.ai/legal/terms-of-service'],
  ['Moonshot AI', 'https://platform.moonshot.ai/docs/agreement/modeluse'],
  ['Reka AI', 'https://reka.ai/legal/terms-of-use'],
  ['SambaNova', 'https://sambanova.ai/terms-and-conditions'],
  ['MiniMax', 'https://www.minimax.io/platform/protocol/terms-of-service'],
  ['Z.ai', 'https://chat.z.ai/legal-agreement/terms-of-service'],
  ['io.net', 'https://io.net/terms'],
  ['Claude Platform on AWS', 'https://www.anthropic.com/legal/commercial-terms'],
  ['Ionstream', 'https://ionstream.ai/terms-and-conditions/'],
  ['Cohere', 'https://cohere.com/terms-of-use'],
  ['Baseten', 'https://www.baseten.co/terms-and-conditions'],
  ['Groq', 'https://groq.com/terms-of-use/'],
  ['Modal', 'https://modal.com/legal/terms'],
  ['DeepSeek', 'https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html'],
  ['Crusoe', 'https://legal.crusoe.ai/open-router#managed-inference-tos-open-router'],
  ['Darkbloom', 'https://www.darkbloom.dev/terms.html'],
  ['Mancer', 'https://mancer.tech/terms'],
  ['NextBit', 'https://www.nextbit256.com/docs/terms-of-service'],
  ['DeepInfra', 'https://deepinfra.com/terms'],
  ['SpaceXAI', 'https://x.ai/legal/terms-of-service-enterprise'],
  ['Sail Research', 'https://www.sailresearch.com/terms'],
  ['Tencent Cloud', 'https://www.tencentcloud.com/en/document/product/301/78869'],
  ['Krea', 'https://www.krea.ai/terms'],
  ['MARA', 'https://www.mara.com/mara-legals/ai-policies#cloud-toc'],
  ['Perceptron', 'https://www.perceptron.inc/terms-of-use'],
  ['Sourceful', 'https://www.sourceful.com/legal/spring-terms-of-use'],
  ['Fish Audio', 'https://fish.audio/terms'],
  ['Azure', 'https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true'],
  ['Cloudflare', 'https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms'],
  ['Nebius Token Factory', 'https://docs.nebius.com/legal/studio/terms-of-use/'],
  ['AionLabs', 'https://www.aionlabs.ai/terms/'],
  ['Liquid', 'https://www.liquid.ai/terms-conditions'],
  ['Decart', 'https://cogito.decart.ai/legal/terms'],
  ['Meta', 'https://ai.developer.meta.com/legal/terms-of-service'],
  ['Phala', 'https://redpill.ai/terms'],
  ['Seed', 'https://docs.byteplus.com/en/docs/legal/docs-terms-of-service'],
  ['CoreWeave', 'https://docs.coreweave.com/policies/terms-of-service'],
  ['DekaLLM', 'https://docs.cloudeka.ai/service-portal-ai/end-user-license-agreement'],
  ['SiliconFlow', 'https://docs.siliconflow.com/en/legals/terms-of-service'],
  ['Poolside', 'http://poolside.ai/legal'],
  ['ModelRun [by Modular]', 'https://www.modular.com/legal/terms'],
  ['Anthropic', 'https://www.anthropic.com/legal/commercial-terms'],
  ['Baidu Qianfan', 'https://intl.cloud.baidu.com/en/doc/Agreements/s/bmesahnjh-intl-en'],
  ['AtlasCloud', 'https://www.atlascloud.ai/privacy'],
  ['Together', 'https://www.together.ai/terms-of-service'],
  ['Runway', 'https://runwayml.com/terms-of-use'],
  ['DigitalOcean', 'https://www.digitalocean.com/legal/terms-of-service-agreement'],
  ['Nex AGI', 'https://api.nex-agi.cn/privacy-policy'],
  ['Alibaba Cloud Int.', 'https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0'],
  ['Thinking Machines', 'https://thinkingmachines.ai/legal/tml-free-research-api-tier-terms-of-service.pdf'],
  ['Chutes', 'https://chutes.ai/tos'],
  ['Inceptron', 'https://www.inceptron.io/termsofservice'],
  ['Upstage', 'https://www.upstage.ai/terms-of-service'],
  ['Google Vertex', 'https://cloud.google.com/terms/'],
  ['Google AI Studio', 'https://cloud.google.com/terms/'],
  ['Xiaomi', 'https://platform.xiaomimimo.com/#/docs/terms/user-agreement'],
  ['Parasail', 'https://parasail.io/legal/terms-of-service'],
  ['OpenInference', 'https://www.openinference.ai/terms'],
  ['NVIDIA', 'https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf'],
  ['Relace', 'https://www.relace.ai/terms-of-use'],
  ['OpenAI', 'https://openai.com/policies/row-terms-of-use/'],
  ['inference.net', 'https://inference.net/terms-of-service'],
  ['Amazon Bedrock', 'https://aws.amazon.com/service-terms/'],
  ['StreamLake', 'https://www.streamlake.ai/document/DOC/mgkchnd89grpt1961fw'],
  ['Venice', 'https://venice.ai/legal/tos'],
  ['Sakana', 'https://console.sakana.ai/terms-of-service'],
  ['Inception', 'https://www.inceptionlabs.ai/terms'],
  ['Friendli', 'https://friendli.ai/terms-of-service'],
  ['AkashML', 'https://akashml.com/terms'],
  ['HeyGen', 'https://www.heygen.com/terms'],
  ['Perplexity', 'https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service'],
  ['Wafer', 'https://www.wafer.ai/terms'],
  ['GMICloud', 'https://www.gmicloud.ai/terms-and-conditions'],
  ['Fireworks', 'https://fireworks.ai/terms-of-service'],
  ['Mistral', 'https://mistral.ai/terms/#terms-of-use'],
  ['NovitaAI', 'https://novita.ai/legal/terms-of-service'],
];

const covered = [], newFamilies = [];
for (const [name, url] of list) {
  const hit = existing.get(norm(url));
  if (hit) covered.push([name, url, hit]);
  else newFamilies.push([name, url]);
}

console.log(`Total entries: ${list.length}`);
console.log(`\n=== COVERED (same sourceUrl already tracked) — ${covered.length} ===`);
for (const [name, , hit] of covered) console.log(`  ${name} → ${hit}`);
console.log(`\n=== NEW FAMILY (no row with this sourceUrl) — ${newFamilies.length} ===`);
for (const [name, url] of newFamilies) console.log(`  ${name}: ${url}`);
