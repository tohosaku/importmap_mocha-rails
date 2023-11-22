pin "importmap_mocha"

pin "@mswjs/interceptors", to: "@mswjs--interceptors.js"
pin "@mswjs/interceptors/presets/browser" , to: "@mswjs--interceptors--presets--browser.js"

pin "@open-draft/logger", to: "@open-draft--logger.js" # @0.3.0
pin "is-node-process", to: "is-node-process.js" # @1.2.0
pin "outvariant", to: "outvariant.js" # @1.4.0
pin "@open-draft/until", to: "@open-draft--until.js" # @2.1.0
pin "@open-draft/deferred-promise", to: "@open-draft--deferred-promise.js" # @2.2.0
pin "strict-event-emitter", to: "strict-event-emitter.js" # @0.5.1

Rails.application.config.importmap_mocha_path.each do |path|
  pin_all_from path
end
