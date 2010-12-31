<?php
  /*
  Plugin Name: Ai Loader (jQuery Lazy Load)
  Plugin URI: http://github.com/borisschapira/Ai-Loader--jQuery-Lazy-Load-
  Description: Plugin for real lazy load of images
  Version: v0.2
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
  $placeholdergif = plugins_url(get_option('placeholderOption'), __FILE__);
  $thresholdint = get_option('thresholdOption');
  echo <<<EOF
<script type="text/javascript">
jQuery(document).ready(function($){
  if (navigator.platform == "iPad") return;
  jQuery("img.wp-post-image").lazyload({
   effect:"fadeIn",
   placeholder: "$placeholdergif",
   threshold:$thresholdint
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

function ai_create_menu() {
	//create new top-level menu
	add_menu_page('Ai Loader', 'Ai Settings', 'administrator', __FILE__, 'ai_settings_page',plugins_url('/images/grey.gif', __FILE__));

	//call register settings function
	add_action( 'admin_init', 'register_aisettings' );
}

function register_aisettings() {
	//register Ai settings
	register_setting( 'ai-settings-group', 'placeholderOption' );
	register_setting( 'ai-settings-group', 'thresholdOption' );
}

function ai_settings_page() {
?>
<div class="wrap">
<h2>A&iuml; Loader (jQuery Lazy Load) Options</h2>

<form method="post" action="options.php">
    <?php settings_fields( 'ai-settings-group' ); ?>
    <table class="form-table">
        <tr valign="top">
        <th scope="row">Placeholder (ex: images/grey.gif)</th>
        <td><input type="text" name="placeholderOption" value="<?php echo get_option('placeholderOption'); ?>" /></td>
        </tr>
         
        <tr valign="top">
        <th scope="row">Threshold (in pixels)</th>
        <td><input type="text" name="thresholdOption" value="<?php echo get_option('thresholdOption'); ?>" /></td>
        </tr>
    </table>
    
    <p class="submit">
    <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
    </p>

</form>
</div>
<?php }

add_action('wp_head', 'jquery_lazy_load_headers', 5);  
add_action('wp_head', 'jquery_lazy_load_ready', 12);
add_filter( 'post_thumbnail_html', 'jquery_lazy_load_post_image_html', 10, 3 ); 
add_action('admin_menu', 'ai_create_menu');

?>
