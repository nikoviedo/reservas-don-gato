<?php
/**
 * Template Name: Don Gato Reservas SPA
 */

get_header();
?>
<div id="root"></div>
<script>
  window.DG_API_BASE = "<?php echo esc_url_raw( home_url('/wp-json/dg/v1') ); ?>";
  window.DG_NONCE = "<?php echo esc_js( wp_create_nonce('wp_rest') ); ?>";
</script>
<link rel="stylesheet" href="<?php echo esc_url( get_stylesheet_directory_uri() . '/dg-spa/assets/index.css' ); ?>" />
<script type="module" src="<?php echo esc_url( get_stylesheet_directory_uri() . '/dg-spa/assets/index.js' ); ?>"></script>
<?php
get_footer();
