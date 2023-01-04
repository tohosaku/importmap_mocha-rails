require_relative "lib/importmap_mocha/version"

Gem::Specification.new do |spec|
  spec.name        = "importmap_mocha-rails"
  spec.version     = ImportmapMocha::VERSION
  spec.authors     = ["Takashi Kato"]
  spec.email       = ["tohosaku@users.osdn.me"]
  spec.homepage    = "https://github.com/tohosaku/importmap_mocha-rails"
  spec.summary     = "Add JavaScript testing tools in importmap environment."
  spec.description = "Add JavaScript testing tools in importmap environment."

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = spec.homepage

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 7.0.4"
end
