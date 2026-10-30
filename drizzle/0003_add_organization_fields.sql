ALTER TABLE `accounts` ADD `is_favorite` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `accounts` ADD `category` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `backup_codes` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `usage_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `accounts` ADD `last_used_at` integer;
