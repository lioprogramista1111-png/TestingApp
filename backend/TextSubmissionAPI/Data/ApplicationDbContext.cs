using Microsoft.EntityFrameworkCore;
using TextSubmissionAPI.Models;

namespace TextSubmissionAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<TextSubmission> TextSubmissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TextSubmission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Text).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired();
            });
        }
    }
}
