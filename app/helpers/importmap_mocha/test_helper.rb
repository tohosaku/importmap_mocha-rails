# frozen_string_literal: true

module ImportmapMocha
  module TestHelper
    PATTERN = ['**/*.test.js', '**/*.spec.js'].freeze

    def testcase
      files.map { |m| javascript_import_module_tag(m.to_s.sub('.js', '')) }.join("\n").html_safe
    end

    def files
      root_path.flat_map { |path| path.glob(PATTERN).map { |m| m.relative_path_from(path) } }
    end

    def root_path
      Rails.application.config.importmap_mocha_path
    end
  end
end
