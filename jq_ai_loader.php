<?php
  /*
  Plugin Name: Ai Loader (jQuery Lazy Load)
  Plugin URI: http://github.com/borisschapira/Ai-Loader--jQuery-Lazy-Load-
  Description: Plugin for real lazy load of images
  Version: v0.1.1
  Author: Boris Schapira
  Author URI: http://www.borisschapira.com
  */

function jquery_lazy_load_headers() {
  $plugin_path = plugins_url('/', __FILE__);
  $aiLazy_url = $plugin_path . 'javascripts/jquery.ailazyload.mini.js';
  $base64_url = $plugin_path . 'javascripts/jquery.base64.mini.js';  
  $jq_url = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
  wp_deregister_script('jquery');
  wp_enqueue_script('jquery', $jq_url, false, '1.4.2');
  wp_enqueue_script('jquerylazyload', $aiLazy_url, 'jquery', '0.4.1');
  wp_enqueue_script('base64Functions', $base64_url, 'jquery', '1.0.0');}

function jquery_lazy_load_ready() {
  $placeholdergif = plugins_url('images/grey.gif', __FILE__);
  echo <<<EOF
<script type="text/javascript">
jQuery(document).ready(function($){
  if (navigator.platform == "iPad") return;
  jQuery("img.wp-post-image").lazyload({
   effect:"fadeIn",
   placeholder: "$placeholdergif"
  });
});
</script>
EOF;
}

function jquery_lazy_load_post_image_html( $html, $post_id, $post_image_id ) {	
	$log = false;
	// Get the source of the image
	$doc=new DOMDocument();
	$doc->loadHTML($html);	
	$xml=simplexml_import_dom($doc);
	$images=$xml->xpath('//img');		
	if($log) $scriptToAdd = '<script type="text/javascript">';
	if(count($images) == 1) // The img source has been found	
	{
		$source = $images[0]['src'];
		$html = str_replace('class="', 'class="src-'.esc_attr(base64_encode($source)).' ', $html);
		$html =  str_replace('src=', 'data-src=', $html);		
		if($log) {
			$scriptToAdd = $scriptToAdd.'console.log("Source : '.esc_attr($source).'");';
			$scriptToAdd = $scriptToAdd.'console.log("Encoded : '.esc_attr(base64_encode($source)).'");';
			$scriptToAdd = $scriptToAdd.'console.log("New source: '.esc_attr($html).'");';
		}
	}
	if($log) {
		$scriptToAdd = $scriptToAdd.'</script>';
		$html = $scriptToAdd.$html;
	}
	return $html;
}

add_action('wp_head', 'jquery_lazy_load_headers', 5);  
add_action('wp_head', 'jquery_lazy_load_ready', 12);
add_filter( 'post_thumbnail_html', 'jquery_lazy_load_post_image_html', 10, 3 );  

?>
