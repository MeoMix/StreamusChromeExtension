import Videos from 'background/collection/videos';
import SearchResults from 'background/collection/searchResults';

describe('SearchResults', function() {
  beforeEach(function() {
    this.searchResults = new SearchResults();
  });

  it('should be able to parse a video into a search result', function() {
    var video = TestUtility.buildVideo();
    var searchResult = this.searchResults._mapVideoAsSearchResult(video);

    expect(searchResult.get('video')).to.equal(video);
  });

  it('should be able to parse an array of videos into an array of search results', function() {
    var videos = [TestUtility.buildVideo('N92CLZlsNRw'), TestUtility.buildVideo('bek1y2uiQGA')];
    var searchResults = this.searchResults._mapVideosAsSearchResults(videos);

    expect(searchResults.length).to.equal(2);
    expect(searchResults[0].get('video')).to.equal(videos[0]);
    expect(searchResults[1].get('video')).to.equal(videos[1]);
  });

  it('should be able to parse a collection of videos into an array of search results', function() {
    var videos = new Videos([TestUtility.buildVideo('N92CLZlsNRw'), TestUtility.buildVideo('bek1y2uiQGA')]);
    var searchResults = this.searchResults._mapVideosAsSearchResults(videos);

    expect(searchResults.length).to.equal(2);
    expect(searchResults[0].get('video')).to.equal(videos.at(0));
    expect(searchResults[1].get('video')).to.equal(videos.at(1));
  });

  it('should be able to parse a single video into an array of search results', function() {
    var video = TestUtility.buildVideo();
    var searchResults = this.searchResults._mapVideosAsSearchResults(video);

    expect(searchResults.length).to.equal(1);
    expect(searchResults[0].get('video')).to.equal(video);
  });

  it('should be able to add videos', function() {
    var videos = new Videos([TestUtility.buildVideo('N92CLZlsNRw'), TestUtility.buildVideo('bek1y2uiQGA')]);
    this.searchResults.addVideos(videos);

    expect(this.searchResults.length).to.equal(videos.length);
  });

  it('should trigger an add:completed event after adding videos', function() {
    sinon.spy(this.searchResults, 'trigger');
    var videos = new Videos([TestUtility.buildVideo('N92CLZlsNRw'), TestUtility.buildVideo('bek1y2uiQGA')]);
    this.searchResults.addVideos(videos);

    expect(this.searchResults.trigger.calledWith('add:completed')).to.equal(true);
    this.searchResults.trigger.restore();
  });
});