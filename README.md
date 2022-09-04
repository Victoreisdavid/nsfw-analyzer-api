# nsfw-analyzer-api
API simples que analisa imagens usando o [NSFWJS](https://github.com/infinitered/nsfwjs)

## selfhost

### Número de workers
O número de workers é definido pela variavel de ambiente `WORKERS`, se não for colocado nada, será o mesmo número de núcleos da sua CPU.

#### Muito cuidado com números altos
O tensorflow é pesado e usa MUITA MEMÓRIA RAM, números altos podem usar toda a memória do seu computador, já que terá mais instâncias do tensorflow.
Eu iniciei 16 workers no gitpod (que é o número de núcleos da cpu deles) e o uso de memória foi nada mais que **49 GIGABYTES**!

### Rodando a API
Para rodar a api, é só instalar as dependências com `npm install` e rodar usando `node .`