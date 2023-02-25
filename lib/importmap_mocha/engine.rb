# frozen_string_literal: true

module ImportmapMocha
  class Engine < ::Rails::Engine
    config.before_initialize do
      Rails.application.config.importmap_mocha_path = []
      %w[test spec].each do |d|
        path = Rails.root.join(d, 'javascripts')
        Rails.application.config.importmap_mocha_path << path if path.exist?
      end
    end

    initializer 'importmap_mocha.assets' do
      if Rails.application.config.respond_to?(:assets)
        Rails.application.config.assets.paths << Engine.root.join('app/assets/javascripts')
        Rails.application.config.assets.paths << Engine.root.join('app/assets/stylesheets')
        Rails.application.config.assets.paths << Engine.root.join('vendor/javascripts')
        Rails.application.config.assets.paths << Engine.root.join('vendor/stylesheets')
        Rails.application.config.assets.paths += Rails.application.config.importmap_mocha_path
      end
    end

    PRECOMPILE_ASSETS = %w[importmap_mocha.js chai.js mocha.js mocha.css].freeze

    initializer 'turbo.assets' do
      Rails.application.config.assets.precompile += PRECOMPILE_ASSETS if Rails.application.config.respond_to?(:assets)
    end

    initializer 'importmap_mocha.importmap', before: 'importmap' do |app|
      app.config.importmap.paths << Engine.root.join('config/importmap.rb') if Rails.application.respond_to?(:importmap)
    end

    initializer 'importmap_mocha.routes' do
      Rails.application.routes.prepend do
        scope module: 'importmap_mocha' do
          get '/mockServiceWorker.js' => 'test#worker'
          get '/rails/info/mocha' => 'test#index'
        end
      end
    end

    initializer 'importmap_mocha.config' do
      unless Rails.application.config.respond_to?(:importmap_mocha_style)
        Rails.application.config.importmap_mocha_style = 'bdd'
      end
      unless Rails.application.config.respond_to?(:importmap_mocha_scripts)
        Rails.application.config.importmap_mocha_scripts = []
      end
    end
  end
end
