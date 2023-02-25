pin "importmap_mocha"
Rails.application.config.importmap_mocha_path.each do |path|
  pin_all_from path
end
