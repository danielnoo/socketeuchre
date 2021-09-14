FROM mhart/alpine-node:9 AS build
WORKDIR /srv
ADD package.json .
RUN npm install
ADD . .

FROM mhart/alpine-node:base-9
COPY --from=build /srv .
EXPOSE 5505
CMD ["node", "index.js"]