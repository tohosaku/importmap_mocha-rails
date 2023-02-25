# frozen_string_literal: true

module ImportmapMocha
  class TestController < ActionController::Base
    layout false
    skip_before_action :verify_authenticity_token, only: :worker
    def index; end

    def worker
    end
  end
end
