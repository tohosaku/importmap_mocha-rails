module ImportmapMocha::TestHelper
  def testcase
    s = files.map do |f|
      javascript_import_module_tag(f.basename('.js'))
    end
    s.join('').html_safe
  end

  def files
    root_path.flat_map{|path| path.glob('**/*.js')}
  end

  def root_path
    Rails.application.config.importmap_mocha_path
  end
end
